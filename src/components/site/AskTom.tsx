import { useEffect, useRef, useSyncExternalStore, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, CalendarDays, Loader2, Mail, Mic, Search, Square } from "lucide-react";
import { askTom as content } from "@/content";
import { HUMAN_CHECK_PROMPT, MAX_VISITOR_TURN, PROFILE_LOOKUP_STATUS, askTom, turnstile, type MessageProgress } from "@/lib/tom";
import { linkify } from "@/lib/text";
import { Section } from "./Section";

export function AskTom() {
  const {
    suggestedQuestions,
    turns,
    draft,
    busy,
    notice,
    lookingUpProfile,
    messageProgress,
    humanCheckNeeded,
    announcement,
    paused,
    ended,
    dictation,
    dictationProblem,
    accepting,
    canSend,
  } = useSyncExternalStore(askTom.subscribe, askTom.getState);

  const sectionRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  // Load the Suggested questions once the section is close to the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        askTom.loadSuggestions();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [turns, lookingUpProfile, messageProgress, notice, humanCheckNeeded]);

  const onTranscriptScroll = () => {
    const el = transcriptRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const send = (text: string) => {
    stickToBottom.current = true;
    askTom.send(text);
  };

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

  const listening = dictation === "listening";
  const started = turns.length > 0;
  const remaining = MAX_VISITOR_TURN - draft.length;

  return (
    <Section id="ask-tom" label="05 — Ask Tom" title={content.title}>
      <div
        ref={sectionRef}
        onPointerEnter={turnstile.preload}
        onFocusCapture={turnstile.preload}
        className="overflow-hidden rounded-3xl border bg-surface"
      >
        <div className="p-6 sm:p-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted">{content.intro}</p>
          <p className="mt-2 text-xs text-subtle">
            <a href="/privacy/#tom" className="link-underline">
              How Tom handles your data
            </a>
          </p>

          {!started && suggestedQuestions.length > 0 && (
            <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap" aria-label="Suggested questions">
              {suggestedQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    disabled={!accepting}
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
                        {humanCheckNeeded ? (
                          HUMAN_CHECK_PROMPT
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

            {messageProgress && <StatusLine icon={messageProgressIcons[messageProgress.status]} text={messageProgress.text} />}
            {lookingUpProfile && <StatusLine icon={<Search aria-hidden className="h-3.5 w-3.5" />} text={PROFILE_LOOKUP_STATUS} />}

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
              onChange={(e) => askTom.setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_VISITOR_TURN}
              rows={1}
              disabled={ended}
              placeholder={ended ? "This conversation has ended" : "Ask about Abdallah's work…"}
              aria-describedby="ask-tom-hint"
              className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-2.5 text-base leading-relaxed outline-none [field-sizing:content] placeholder:text-subtle focus:border-foreground/30 disabled:opacity-60 sm:text-[15px]"
            />
            {dictation !== "unsupported" && (
              <button
                type="button"
                onClick={() => (listening ? askTom.stopDictation() : askTom.startDictation())}
                disabled={ended}
                aria-label={listening ? "Stop speaking your question" : "Speak your question"}
                aria-pressed={listening}
                title="Your browser may send the audio to its speech service to turn it into text."
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30 ${
                  listening ? "bg-accent-soft text-accent" : "bg-foreground/5 hover:bg-foreground/10"
                }`}
              >
                {listening ? <Square aria-hidden className="h-3.5 w-3.5 fill-current" /> : <Mic aria-hidden className="h-4 w-4" />}
              </button>
            )}
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
              {paused
                ? "Questions are paused for now. Try again later."
                : listening
                  ? "Listening… It stops when you pause. Check the text, then send."
                  : (dictationProblem ?? "Conversations are limited, so ask what matters most.")}
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

const messageProgressIcons: Record<MessageProgress, ReactNode> = {
  sending: <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />,
  sent: <Mail aria-hidden className="h-3.5 w-3.5 text-accent" />,
  not_sent: null,
};

/** What Tom is doing, kept out of his reply bubble so it never reads as part of what he said. */
function StatusLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs text-subtle">
      {icon}
      {text}
    </p>
  );
}

function PillLink({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={() => askTom.followLink(href)}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-foreground/30"
    >
      {children}
    </a>
  );
}

/** Turns URLs and email addresses in plain text into links. */
function Linkified({ text }: { text: string }) {
  return (
    <>
      {linkify(text).map(({ text: part, href }, i) =>
        href ? (
          <a key={i} href={href} onClick={() => askTom.followLink(href)} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="link-underline text-accent">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
