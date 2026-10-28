import { CONTACT_EMAIL, eventStream, json, rejections, streamError, type StreamEvent } from "./fixtures";

// Dev-only stand-in for the Worker, which only accepts requests from https://abdallahdaknache.com.
// Put one of these words in a question to try a path:
//   /rate     rate_limited (Retry-After: 30)
//   /limit    turn_limit_reached (also happens on its own after 8 Visitor turns)
//   /verify   verification_failed once, so the widget retries with a fresh token
//   /reload   verification_failed twice, so the widget gives up
//   /error    an error event partway through the reply
//   /cut      the stream closes with no done or error
//   /slow     a slow reply
//   /message  a Message for Abdallah that's sent; "/message fail" for one that isn't
//   /invalid  invalid_request

const TURN_LIMIT = 8;
const conversations = new Map<string, number>();
const verificationFailures = new Map<string, number>();

// crypto.randomUUID only exists in secure contexts, and dev may run over plain http on a LAN IP.
const uuid = () => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

const words = (text: string, delayMs = 40): StreamEvent[] =>
  text.split(/(?<= )/).map((w) => ({ event: "text_delta", data: { text: w }, delayMs }));

const done: StreamEvent = { event: "done", data: {} };

export const mockFetch: typeof fetch = async (input, init) => {
  await new Promise((r) => setTimeout(r, 300));
  const url = new URL(String(input));

  if (url.pathname === "/suggestions") {
    return json(200, {
      questions: [
        "What does Abdallah do at Pepperstone?",
        "How does Abdallah use AI in his engineering work?",
        "How can I get in touch or book a call with him?",
      ],
    });
  }
  if (url.pathname !== "/chat" || init?.method !== "POST") return new Response("Not found", { status: 404 });

  const body = JSON.parse(String(init.body));
  const message: string = body.message;
  const has = (word: string) => message.toLowerCase().includes(word);

  if (has("/rate")) return rejections.rate_limited();
  if (has("/invalid")) return rejections.invalid_request();

  const failures = verificationFailures.get(message) ?? 0;
  const failuresWanted = has("/reload") ? 2 : has("/verify") ? 1 : 0;
  if (failures < failuresWanted) {
    verificationFailures.set(message, failures + 1);
    return rejections.verification_failed();
  }

  let id: string | undefined = body.conversationId;
  if (!id || !conversations.has(id)) {
    if (!body.turnstileToken) return rejections.verification_failed();
    id = uuid();
    conversations.set(id, 0);
  }
  const turns = conversations.get(id)!;
  if (turns >= TURN_LIMIT || has("/limit")) return rejections.turn_limit_reached();
  conversations.set(id, turns + 1);

  const signal = init.signal;
  if (has("/error")) {
    return eventStream([...words("Abdallah has worked on "), { event: "error", data: streamError, delayMs: 300 }], id, signal);
  }
  if (has("/cut")) return eventStream(words("Abdallah is a senior mobile "), id, signal);
  if (has("/slow")) return eventStream([...words("This reply is arriving slowly, one word at a time.", 600), done], id, signal);
  if (has("/message")) {
    const sent = !has("fail");
    return eventStream(
      [
        { event: "tool_status", data: { status: "sending_message" } },
        { event: "tool_status", data: { status: sent ? "message_sent" : "message_not_sent" }, delayMs: 1200 },
        ...words(
          sent
            ? "Done. I've passed your message on to Abdallah, and he'll reply to the email you gave."
            : `Sorry, I couldn't send that. You can email Abdallah directly at ${CONTACT_EMAIL}.`,
        ),
        done,
      ],
      id,
      signal,
    );
  }

  return eventStream(
    [
      ...words(
        "Abdallah is a Senior Mobile Engineer at Pepperstone, on the platform team behind its trading app. " +
          "He owns core initiatives across mobile and web, such as the shared sign-in module.\n\n" +
          `(Mock reply ${turns + 1} of ${TURN_LIMIT}. You can reach him at ${CONTACT_EMAIL}.)`,
      ),
      done,
    ],
    id,
    signal,
  );
};

export const mockTurnstileToken = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return `dev-token-${uuid()}`;
};
