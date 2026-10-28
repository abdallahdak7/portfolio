import { MAX_VISITOR_TURN, type TomClient, type ToolStatus, type Turn } from "./client";
import type { SpeechRecognition, SpeechRecognitionConstructor, SpeechRecognitionResults } from "@/lib/speech";
import type { Turnstile } from "./turnstile";

// The state behind the Ask Tom section: the transcript, the draft, and whether the Visitor can send.

export const HUMAN_CHECK_PROMPT = "Tick the box below so Tom can answer.";

export type ShownTurn = Turn & { id: number; streaming: boolean };

/** `unsupported` where the browser has no speech recognition, so there's nothing to offer. */
export type DictationStatus = "unsupported" | "off" | "listening";

/** Shown when Tom can't answer. */
export type Notice = { message: string; fallbackEmail?: string; bookingLink?: string };

export type AskTomState = {
  /** Shown before the Conversation starts. Empty until `loadSuggestions` has them. */
  suggestedQuestions: string[];
  turns: ShownTurn[];
  draft: string;
  /** A Visitor turn is on its way to Tom. */
  busy: boolean;
  notice: Notice | null;
  /** How a Message for Abdallah is getting on, during the current Tom turn. */
  messageProgress: { status: ToolStatus; text: string } | null;
  /** The Human check is waiting on the Visitor to tick its box. */
  humanCheckNeeded: boolean;
  /** The latest thing to tell a screen reader user. */
  announcement: string;
  /** The Visitor's network asked too many questions; sending is held until the pause ends. */
  paused: boolean;
  /** The Conversation reached its turn limit or the Visitor couldn't be verified; nothing more can be sent. */
  ended: boolean;
  dictation: DictationStatus;
  /** Why the last Dictation heard nothing. Cleared when the next one starts. */
  dictationProblem: string | null;
  /** Tom will take a Visitor turn now: not busy, Paused or Ended. */
  accepting: boolean;
  /** Tom is accepting and the draft can be sent. */
  canSend: boolean;
};

type Derived = "accepting" | "canSend";

export type AskTom = {
  getState(): AskTomState;
  /** Calls the listener after every state change. Returns an unsubscribe. */
  subscribe(listener: () => void): () => void;
  /** Fetches the Suggested questions. Only the first call fetches; later calls return the same promise. */
  loadSuggestions(): Promise<void>;
  /** Typing over a Dictation stops it, so it can't overwrite what was typed. */
  setDraft(text: string): void;
  /** Listens for one spoken question and writes it after the draft as it's heard. Never sends. */
  startDictation(): void;
  /** Stops listening. What was already heard stays in the draft. */
  stopDictation(): void;
  /** Sends one Visitor turn. Stops any Dictation first, so nothing heard late lands in the next draft. Resolves once Tom's reply has finished or the turn was withdrawn. */
  send(text: string): Promise<void>;
};

export type AskTomOptions = {
  tom: TomClient;
  humanCheck: Pick<Turnstile, "onInteractive">;
  fallbackEmail: string;
  /** The browser's speech recognition. Without it, Dictation is `unsupported`. */
  speechRecognition?: SpeechRecognitionConstructor;
};

const DICTATION_PROBLEMS: Record<string, string> = {
  "no-speech": "Didn't catch that. Try again, or type your question.",
  "not-allowed": "Microphone access is blocked. Allow it in your browser to speak your question, or type it.",
  "service-not-allowed": "Microphone access is blocked. Allow it in your browser to speak your question, or type it.",
  "audio-capture": "No microphone found. Type your question instead.",
  network: "Speech recognition needs a connection. Type your question instead.",
};
const DICTATION_FAILED = "Speech recognition stopped. Type your question instead.";

export function createAskTom({ tom, humanCheck, fallbackEmail, speechRecognition }: AskTomOptions): AskTom {
  let state: AskTomState = {
    suggestedQuestions: [],
    turns: [],
    draft: "",
    busy: false,
    notice: null,
    messageProgress: null,
    humanCheckNeeded: false,
    announcement: "",
    paused: false,
    ended: false,
    dictation: speechRecognition ? "off" : "unsupported",
    dictationProblem: null,
    accepting: true,
    canSend: false,
  };
  const listeners = new Set<() => void>();
  const conversation = tom.startConversation();
  let nextId = 0;
  let suggestions: Promise<void> | null = null;
  let recognition: SpeechRecognition | null = null;

  const update = (change: Partial<Omit<AskTomState, Derived>>) => {
    const next = { ...state, ...change };
    const accepting = !next.busy && !next.paused && !next.ended;
    state = { ...next, accepting, canSend: accepting && sendable(next.draft) };
    listeners.forEach((l) => l());
  };
  /** For failures without a server payload, so the Fallback email comes from the site's own content. */
  const localNotice = (problem: string): Notice => ({
    message: `${problem}, or email Abdallah at ${fallbackEmail}.`,
    fallbackEmail,
  });
  const messageProgressCopy: Record<ToolStatus, string> = {
    sending_message: "Passing your message to Abdallah…",
    message_sent: "Done. Your message is on its way to Abdallah.",
    message_not_sent: `Your message didn't go through. You can email Abdallah at ${fallbackEmail}.`,
  };
  const showNotice = (notice: Notice) => update({ notice, announcement: notice.message });
  const pauseFor = (seconds: number) => {
    update({ paused: true });
    setTimeout(() => update({ paused: false }), seconds * 1000);
  };
  const updateTurn = (id: number, change: (turn: ShownTurn) => Partial<ShownTurn>) =>
    update({ turns: state.turns.map((t) => (t.id === id ? { ...t, ...change(t) } : t)) });

  /** Drops the current Dictation without a word: whatever it hears from now on is ignored. */
  const abandonDictation = () => {
    if (!recognition) return;
    const abandoned = recognition;
    recognition = null;
    abandoned.abort();
    update({ dictation: "off" });
  };

  humanCheck.onInteractive((needed) =>
    update(needed ? { humanCheckNeeded: true, announcement: HUMAN_CHECK_PROMPT } : { humanCheckNeeded: false }),
  );

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    loadSuggestions() {
      suggestions ??= tom.getSuggestions().then((suggestedQuestions) => update({ suggestedQuestions }));
      return suggestions;
    },

    setDraft(text) {
      abandonDictation();
      update({ draft: text });
    },

    startDictation() {
      if (!speechRecognition || recognition || state.ended) return;
      const listening = new speechRecognition();
      const before = state.draft.trimEnd();
      listening.continuous = false;
      listening.interimResults = true;
      listening.onresult = ({ results }) => {
        if (recognition !== listening) return;
        const heard = transcript(results);
        update({ draft: (before && heard ? `${before} ${heard}` : before + heard).slice(0, MAX_VISITOR_TURN) });
      };
      listening.onerror = ({ error }) => {
        if (recognition !== listening || error === "aborted") return;
        const problem = DICTATION_PROBLEMS[error] ?? DICTATION_FAILED;
        update({ dictationProblem: problem, announcement: problem });
      };
      listening.onend = () => {
        if (recognition !== listening) return;
        recognition = null;
        update({ dictation: "off", ...(state.dictationProblem ? {} : { announcement: "Stopped listening." }) });
      };

      recognition = listening;
      update({ dictation: "listening", dictationProblem: null, announcement: "Listening…" });
      try {
        listening.start();
      } catch {
        recognition = null;
        update({ dictation: "off", dictationProblem: DICTATION_FAILED, announcement: DICTATION_FAILED });
      }
    },

    stopDictation() {
      recognition?.stop();
    },

    async send(text) {
      const message = text.trim();
      if (!state.accepting || !sendable(message)) return;
      abandonDictation();
      const visitorId = nextId++;
      const tomId = nextId++;
      update({
        turns: [
          ...state.turns,
          { id: visitorId, role: "visitor", text: message, streaming: false },
          { id: tomId, role: "tom", text: "", streaming: true },
        ],
        draft: "",
        busy: true,
        notice: null,
        messageProgress: null,
        announcement: "Tom is replying…",
      });

      const result = await conversation.sendTurn(message, {
        onText: (piece) => updateTurn(tomId, (t) => ({ text: t.text + piece })),
        onToolStatus: (status) => {
          const text = messageProgressCopy[status];
          update({ messageProgress: { status, text }, announcement: text });
        },
      });
      update({ busy: false });

      const stopStreaming = () => updateTurn(tomId, () => ({ streaming: false }));
      // A Withdrawn turn never reached Tom: take it back out and return the text to the draft.
      const withdraw = () =>
        update({
          turns: state.turns.filter((t) => t.id !== visitorId && t.id !== tomId),
          draft: state.draft || message,
        });

      switch (result.kind) {
        case "done":
          stopStreaming();
          update({ announcement: `Tom: ${result.reply}` });
          return;
        case "error":
          if (result.partialReply) stopStreaming();
          else update({ turns: state.turns.filter((t) => t.id !== tomId) });
          showNotice({ message: result.message, fallbackEmail: result.fallbackEmail });
          return;
        case "failed":
          if (result.partialReply) stopStreaming();
          else withdraw();
          showNotice(localNotice("Tom can't be reached right now. Check your connection and try again"));
          return;
        case "unverified":
          withdraw();
          showNotice(localNotice("Tom needs a quick check that you're human before he can answer. Please try again"));
          return;
        case "invalid":
          // Unreachable while send() checks the text first, but a turn left streaming would never end.
          withdraw();
          return;
        case "rejected":
          withdraw();
          switch (result.error) {
            case "rate_limited":
              if (result.retryAfterSeconds) pauseFor(result.retryAfterSeconds);
              showNotice({ message: result.message, fallbackEmail: result.fallbackEmail });
              return;
            case "turn_limit_reached":
              update({ ended: true });
              showNotice({ message: result.message, fallbackEmail: result.fallbackEmail, bookingLink: result.bookingLink });
              return;
            case "verification_failed":
              update({ ended: true });
              showNotice({ message: result.message, fallbackEmail: result.fallbackEmail });
              return;
            default:
              showNotice(localNotice("Tom couldn't take that question. Try asking it another way, more briefly"));
          }
      }
    },
  };
}

function transcript(results: SpeechRecognitionResults) {
  return Array.from(results, (result) => result[0]?.transcript ?? "")
    .join("")
    .trim();
}

function sendable(text: string) {
  const message = text.trim();
  return message.length > 0 && message.length <= MAX_VISITOR_TURN;
}
