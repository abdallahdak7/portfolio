import { readEvents } from "./sse";

// Talks to Tom's Worker. The contract is docs/api.md in abdallahdak7/speak-about-abdallah.

export const MAX_VISITOR_TURN = 400;
const MAX_TOM_TURN = 2000;
const MAX_HISTORY = 16;
const MAX_SUGGESTIONS = 3;

export type Turn = { role: "visitor" | "tom"; text: string };
export type ToolStatus = "sending_message" | "message_sent" | "message_not_sent";

export type Rejection =
  | { kind: "rejected"; error: "rate_limited"; message: string; contactEmail: string; retryAfterSeconds: number | null }
  | { kind: "rejected"; error: "turn_limit_reached"; message: string; contactEmail: string; bookingLink: string }
  | { kind: "rejected"; error: "verification_failed"; message: string; contactEmail: string }
  | { kind: "rejected"; error: "invalid_request" | "message_too_long" };

export type TurnResult =
  | { kind: "done"; reply: string }
  /** The stream ended with an `error` event. The turn still counts against the Conversation. */
  | { kind: "error"; message: string; contactEmail: string; partialReply: string }
  /** Network failure, an unexpected response, a stream that stopped early, or no Turnstile token. */
  | { kind: "failed"; partialReply: string }
  | { kind: "invalid"; reason: "blank" | "too_long" }
  | Rejection;

export type TurnHandlers = {
  onText?: (text: string) => void;
  onToolStatus?: (status: ToolStatus) => void;
};

export type Conversation = {
  /** Sends one Visitor turn. Resolves once Tom's reply has finished streaming or the turn was refused. */
  sendTurn(message: string, handlers?: TurnHandlers): Promise<TurnResult>;
};

export type TomClient = {
  getSuggestions(): Promise<string[]>;
  startConversation(): Conversation;
};

export type TomClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  /** Solves a fresh Turnstile challenge. Tokens are single-use, so this is called once per token-bearing request. */
  getTurnstileToken: () => Promise<string>;
  /** Give up on a response that sends nothing for this long. */
  idleTimeoutMs?: number;
};

class NoToken extends Error {}

export function createTomClient({
  baseUrl,
  fetch: fetchFn = (input, init) => fetch(input, init),
  getTurnstileToken,
  idleTimeoutMs = 45_000,
}: TomClientOptions): TomClient {
  async function getSuggestions() {
    try {
      const res = await fetchFn(`${baseUrl}/suggestions`);
      if (!res.ok) return [];
      const body = await res.json();
      const questions: unknown[] = Array.isArray(body?.questions) ? body.questions : [];
      return questions.filter((q): q is string => typeof q === "string").slice(0, MAX_SUGGESTIONS);
    } catch {
      return [];
    }
  }

  function startConversation(): Conversation {
    let history: Turn[] = [];
    let conversationId: string | null = null;

    async function post(message: string, withToken: boolean, handlers: TurnHandlers): Promise<TurnResult> {
      let turnstileToken: string | undefined;
      if (withToken) {
        try {
          turnstileToken = await getTurnstileToken();
        } catch {
          throw new NoToken();
        }
      }

      const abort = new AbortController();
      let timer = setTimeout(() => abort.abort(), idleTimeoutMs);
      const stillAlive = () => {
        clearTimeout(timer);
        timer = setTimeout(() => abort.abort(), idleTimeoutMs);
      };
      let partialReply = "";

      try {
        const res = await fetchFn(`${baseUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history,
            message,
            ...(conversationId ? { conversationId } : {}),
            ...(turnstileToken ? { turnstileToken } : {}),
          }),
          signal: abort.signal,
        });

        if (res.status !== 200 || !res.body) return await readRejection(res);

        conversationId = res.headers.get("Conversation-Id") ?? conversationId;

        for await (const { event, data } of readEvents(withSignal(res.body, abort.signal))) {
          stillAlive();
          const payload = JSON.parse(data);
          if (event === "text_delta" && typeof payload.text === "string") {
            partialReply += payload.text;
            handlers.onText?.(payload.text);
          } else if (event === "tool_status") {
            handlers.onToolStatus?.(payload.status);
          } else if (event === "done") {
            const visitorTurn: Turn = { role: "visitor", text: message };
            const tomTurn: Turn = { role: "tom", text: partialReply.slice(0, MAX_TOM_TURN) };
            history = [...history, visitorTurn, tomTurn].slice(-MAX_HISTORY);
            return { kind: "done", reply: partialReply };
          } else if (event === "error") {
            return { kind: "error", message: payload.message, contactEmail: payload.contactEmail, partialReply };
          }
        }
        return { kind: "failed", partialReply };
      } catch {
        return { kind: "failed", partialReply };
      } finally {
        clearTimeout(timer);
      }
    }

    return {
      async sendTurn(raw, handlers = {}) {
        const message = raw.trim();
        if (!message) return { kind: "invalid", reason: "blank" };
        if (message.length > MAX_VISITOR_TURN) return { kind: "invalid", reason: "too_long" };

        try {
          const first = await post(message, !conversationId, handlers);
          if (first.kind === "rejected" && first.error === "verification_failed") {
            // Unknown or expired Conversation (or a bad token): retry once with a fresh token.
            return await post(message, true, handlers);
          }
          return first;
        } catch (e) {
          if (e instanceof NoToken) return { kind: "failed", partialReply: "" };
          throw e;
        }
      },
    };
  }

  return { getSuggestions, startConversation };
}

async function readRejection(res: Response): Promise<TurnResult> {
  let body: { error?: string; message: string; contactEmail: string; bookingLink: string };
  try {
    body = await res.json();
  } catch {
    return { kind: "failed", partialReply: "" };
  }
  switch (body?.error) {
    case "rate_limited": {
      const retryAfter = Number(res.headers.get("Retry-After"));
      return {
        kind: "rejected",
        error: "rate_limited",
        message: body.message,
        contactEmail: body.contactEmail,
        retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
      };
    }
    case "turn_limit_reached":
      return {
        kind: "rejected",
        error: "turn_limit_reached",
        message: body.message,
        contactEmail: body.contactEmail,
        bookingLink: body.bookingLink,
      };
    case "verification_failed":
      return { kind: "rejected", error: "verification_failed", message: body.message, contactEmail: body.contactEmail };
    case "invalid_request":
    case "message_too_long":
      return { kind: "rejected", error: body.error };
    default:
      return { kind: "failed", partialReply: "" };
  }
}

/** Ends the stream when the signal aborts, which some fetch implementations don't do for a body already being read. */
function withSignal(body: ReadableStream<Uint8Array>, signal: AbortSignal) {
  const reader = body.getReader();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      signal.addEventListener("abort", () => {
        controller.error(signal.reason);
        reader.cancel().catch(() => {});
      });
    },
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (e) {
        controller.error(e);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}
