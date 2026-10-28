import { MAX_VISITOR_TURN, type TomClient, type ToolStatus, type Turn } from "./client";
import type { Turnstile } from "./turnstile";

// The state behind the Ask Tom section: the transcript, the draft, and whether the Visitor can send.

export const HUMAN_CHECK_PROMPT = "Tick the box below so Tom can answer.";

export type ShownTurn = Turn & { id: number; streaming: boolean };

/** Shown when Tom can't answer. */
export type Notice = { message: string; fallbackEmail?: string; bookingLink?: string };

export type AskTomState = {
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
  /** The draft can be sent now. */
  canSend: boolean;
};

export type AskTom = {
  getState(): AskTomState;
  /** Calls the listener after every state change. Returns an unsubscribe. */
  subscribe(listener: () => void): () => void;
  setDraft(text: string): void;
  /** Sends one Visitor turn. Resolves once Tom's reply has finished or the turn was withdrawn. */
  send(text: string): Promise<void>;
};

export type AskTomOptions = {
  tom: TomClient;
  humanCheck: Pick<Turnstile, "onInteractive">;
  fallbackEmail: string;
};

export function createAskTom({ tom, humanCheck, fallbackEmail }: AskTomOptions): AskTom {
  let state: AskTomState = {
    turns: [],
    draft: "",
    busy: false,
    notice: null,
    messageProgress: null,
    humanCheckNeeded: false,
    announcement: "",
    paused: false,
    ended: false,
    canSend: false,
  };
  const listeners = new Set<() => void>();
  const conversation = tom.startConversation();
  let nextId = 0;

  const update = (change: Partial<Omit<AskTomState, "canSend">>) => {
    const next = { ...state, ...change };
    state = { ...next, canSend: sendable(next, next.draft) };
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

  humanCheck.onInteractive((needed) =>
    update(needed ? { humanCheckNeeded: true, announcement: HUMAN_CHECK_PROMPT } : { humanCheckNeeded: false }),
  );

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setDraft(text) {
      update({ draft: text });
    },

    async send(text) {
      const message = text.trim();
      if (!sendable(state, message)) return;
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

function sendable({ busy, paused, ended }: Omit<AskTomState, "canSend">, text: string) {
  const message = text.trim();
  return !busy && !paused && !ended && message.length > 0 && message.length <= MAX_VISITOR_TURN;
}
