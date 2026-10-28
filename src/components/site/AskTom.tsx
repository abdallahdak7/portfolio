import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, CalendarDays, Loader2, Mail } from "lucide-react";
import { askTom, profile } from "@/content";
import { MAX_VISITOR_TURN, tom, turnstile, type Conversation, type ToolStatus, type Turn, type TurnResult } from "@/lib/tom";
import { Section } from "./Section";

type ShownTurn = Turn & { id: number; streaming?: boolean };

type Notice = { message: string; fallbackEmail?: string; bookingLink?: string };

const toolStatusCopy: Record<ToolStatus, string> = {
  sending_message: "Passing your message to Abdallah…",
  message_sent: "Done. Your message is on its way to Abdallah.",
  message_not_sent: `Your message didn't go through. You can email Abdallah at ${profile.email}.`,
};

const checkCopy = "Tick the box below so Tom can answer.";

/** For failures without a server payload, so the Fallback email comes from the site's own content. */
const localNotice = (problem: string): Notice => ({
  message: `${problem}, or email Abdallah at ${profile.email}.`,
  fallbackEmail: profile.email,
});

export function AskTom() {
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [turns, setTurns] = useState<ShownTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [ended, setEnded] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [checkNeeded, setCheckNeeded] = useState(false);

  const conversation = useRef<Conversation | null>(null);
  const nextId = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  // `busy` only updates on the next render, so this stops a quick double submit from sending twice.
  const sending = useRef(false);

  // Load the Suggested questions once the section is close to the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        tom.getSuggestions().then((q) => !cancelled && setSuggestedQuestions(q));
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  useEffect(
    () =>
      turnstile.onInteractive((needed) => {
        setCheckNeeded(needed);
        if (needed) setAnnouncement(checkCopy);
      }),
    [],
  );

  useEffect(() => {
    if (!blockedUntil) return;
    const t = setTimeout(() => setBlockedUntil(null), Math.max(0, blockedUntil - Date.now()));
    return () => clearTimeout(t);
  }, [blockedUntil]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [turns, toolStatus, notice, checkNeeded]);

  const onTranscriptScroll = () => {
    const el = transcriptRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const sendingPaused = busy || ended || blockedUntil !== null;
  const trimmed = draft.trim();
  const canSend = !sendingPaused && trimmed.length > 0 && trimmed.length <= MAX_VISITOR_TURN;

  async function send(text: string) {
    const message = text.trim();
    if (sending.current || sendingPaused || !message || message.length > MAX_VISITOR_TURN) return;
    sending.current = true;

    conversation.current ??= tom.startConversation();
    const visitorId = nextId.current++;
    const tomId = nextId.current++;
    stickToBottom.current = true;
    setTurns((t) => [...t, { id: visitorId, role: "visitor", text: message }, { id: tomId, role: "tom", text: "", streaming: true }]);
    setDraft("");
    setBusy(true);
    setNotice(null);
    setToolStatus(null);
    setAnnouncement("Tom is replying…");

    const result = await conversation.current.sendTurn(message, {
      onText: (piece) => setTurns((t) => t.map((x) => (x.id === tomId ? { ...x, text: x.text + piece } : x))),
      onToolStatus: (status) => {
        setToolStatus(status);
        setAnnouncement(toolStatusCopy[status]);
      },
    });

    sending.current = false;
    setBusy(false);
    showResult(result, { message, visitorId, tomId });
  }

  function showResult(result: TurnResult, turn: { message: string; visitorId: number; tomId: number }) {
    const stopStreaming = () => setTurns((t) => t.map((x) => (x.id === turn.tomId ? { ...x, streaming: false } : x)));
    // A refused turn never reached Tom: take it back out and return the text to the input.
    const withdraw = () => {
      setTurns((t) => t.filter((x) => x.id !== turn.visitorId && x.id !== turn.tomId));
      setDraft((d) => d || turn.message);
    };
    const dropEmptyReply = (partial: string) =>
      partial ? stopStreaming() : setTurns((t) => t.filter((x) => x.id !== turn.tomId));

    switch (result.kind) {
      case "done":
        stopStreaming();
        setAnnouncement(`Tom: ${result.reply}`);
        return;
      case "error":
        dropEmptyReply(result.partialReply);
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
        withdraw();
        return;
      case "rejected":
        withdraw();
        switch (result.error) {
          case "rate_limited":
            if (result.retryAfterSeconds) setBlockedUntil(Date.now() + result.retryAfterSeconds * 1000);
            showNotice({ message: result.message, fallbackEmail: result.fallbackEmail });
            return;
          case "turn_limit_reached":
            setEnded(true);
            showNotice({ message: result.message, fallbackEmail: result.fallbackEmail, bookingLink: result.bookingLink });
            return;
          case "verification_failed":
            setEnded(true);
            showNotice({ message: result.message, fallbackEmail: result.fallbackEmail });
            return;
          default:
            showNotice(localNotice("Tom couldn't take that question. Try asking it another way, more briefly"));
        }
    }
  }

  function showNotice(n: Notice) {
    setNotice(n);
    setAnnouncement(n.message);
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  };

  const started = turns.length > 0;
  const remaining = MAX_VISITOR_TURN - draft.length;

  return (
    <Section id="ask-tom" label="06 — Ask Tom" title={askTom.title}>
      <div
        ref={sectionRef}
        onPointerEnter={turnstile.preload}
        onFocusCapture={turnstile.preload}
        className="overflow-hidden rounded-3xl border bg-surface"
      >
        <div className="p-6 sm:p-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{askTom.intro}</p>

          {!started && suggestedQuestions.length > 0 && (
            <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap" aria-label="Suggested questions">
              {suggestedQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    disabled={sendingPaused}
                    className="w-full rounded-2xl border bg-background px-4 py-2 text-left text-sm transition-colors hover:border-foreground/30 disabled:opacity-50 sm:w-auto sm:rounded-full"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(started || notice) && (
          <div
            ref={transcriptRef}
            onScroll={onTranscriptScroll}
            aria-label="Conversation with Tom"
            aria-busy={busy}
            role="region"
            tabIndex={0}
            className="max-h-[60vh] space-y-4 overflow-y-auto border-t px-6 py-6 sm:max-h-[28rem] sm:px-8"
          >
            <ol className="space-y-4">
              {turns.map((t) => (
                <li key={t.id} className={t.role === "visitor" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                      t.role === "visitor" ? "bg-foreground text-background" : "bg-background"
                    }`}
                  >
                    <span className="sr-only">{t.role === "visitor" ? "You: " : "Tom: "}</span>
                    {t.role === "tom" ? <Linkified text={t.text} /> : t.text}
                    {t.streaming && !t.text && (
                      <span className="inline-flex items-center gap-2 text-muted">
                        {checkNeeded ? (
                          checkCopy
                        ) : (
                          <>
                            <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> Thinking…
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {toolStatus && (
              <p className="flex items-center gap-2 font-mono text-xs text-subtle">
                {toolStatus === "sending_message" && <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />}
                {toolStatus === "message_sent" && <Mail aria-hidden className="h-3.5 w-3.5 text-accent" />}
                {toolStatusCopy[toolStatus]}
              </p>
            )}

            {notice && (
              <div className="rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm leading-relaxed">
                <p>
                  <Linkified text={notice.message} />
                </p>
                {(notice.bookingLink || notice.fallbackEmail) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {notice.bookingLink && (
                      <PillLink href={notice.bookingLink} external>
                        <CalendarDays aria-hidden className="h-3.5 w-3.5" /> Book a call
                      </PillLink>
                    )}
                    {notice.fallbackEmail && (
                      <PillLink href={`mailto:${notice.fallbackEmail}`}>
                        <Mail aria-hidden className="h-3.5 w-3.5" /> Email Abdallah
                      </PillLink>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="border-t p-4 sm:p-5">
          <div ref={turnstile.attach} className="empty:hidden [&:has(iframe)]:mb-3" />
          <div className="flex items-end gap-2">
            <label htmlFor="ask-tom-input" className="sr-only">
              Your question for Tom
            </label>
            <textarea
              id="ask-tom-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_VISITOR_TURN}
              rows={1}
              disabled={ended}
              placeholder={ended ? "This conversation has ended" : "Ask about Abdallah's work…"}
              aria-describedby="ask-tom-hint"
              className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-2.5 text-base leading-relaxed outline-none [field-sizing:content] placeholder:text-subtle focus:border-foreground/30 disabled:opacity-60 sm:text-[15px]"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send question"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85 disabled:opacity-30"
            >
              {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <ArrowUp aria-hidden className="h-4 w-4" />}
            </button>
          </div>
          <p id="ask-tom-hint" className="mt-2 flex justify-between gap-4 px-1 font-mono text-[11px] text-subtle">
            <span>
              {blockedUntil ? "Questions are paused for now. Try again later." : "Up to 8 questions per chat. Press Enter to send."}
            </span>
            {remaining <= 80 && <span aria-live="polite">{remaining} characters left</span>}
          </p>
        </form>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </Section>
  );
}

function PillLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-foreground/30"
    >
      {children}
    </a>
  );
}

const LINK = /(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"]|[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,})/gi;

/** Turns URLs and email addresses in plain text into links. */
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((part, i) => {
        if (i % 2 === 0) return part;
        const href = part.includes("@") && !part.startsWith("http") ? `mailto:${part}` : part;
        return (
          <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="link-underline text-accent">
            {part}
          </a>
        );
      })}
    </>
  );
}
