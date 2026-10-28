// Responses shaped like the Worker's (docs/api.md in abdallahdak7/speak-about-abdallah).
// Shared by the tests and the dev mock.

export const FALLBACK_EMAIL = "abdallah.daknache@gmail.com";
// The Booking link the Worker sends (src/contact.json in abdallahdak7/speak-about-abdallah). Ask Tom counts it as a
// Contact only if it matches the site's own Booking link, so a test fails if the two drift apart.
export const BOOKING_LINK = "https://calendly.com/abdallah-daknache";

export function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export type StreamEvent = { event: string; data: unknown; delayMs?: number };

export function eventStream(events: StreamEvent[], conversationId: string, signal?: AbortSignal | null) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const { event, data, delayMs } of events) {
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
        if (signal?.aborted) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream", "Conversation-Id": conversationId },
  });
}

/** Tom reads part of Abdallah's Profile. Can come before or between `text_delta`s, more than once. */
export const profileLookup: StreamEvent = { event: "tool_status", data: { status: "looking_up_profile" } };

export const rejections = {
  rate_limited: () =>
    json(
      429,
      {
        error: "rate_limited",
        message: `Too many questions from your network in the last hour. Please wait a while before asking again, or reach Abdallah at ${FALLBACK_EMAIL}.`,
        contactEmail: FALLBACK_EMAIL,
      },
      { "Retry-After": "30" },
    ),
  turn_limit_reached: () =>
    json(429, {
      error: "turn_limit_reached",
      message: `This conversation has reached its limit. You can book a call with Abdallah at ${BOOKING_LINK} or email him at ${FALLBACK_EMAIL}.`,
      bookingLink: BOOKING_LINK,
      contactEmail: FALLBACK_EMAIL,
    }),
  verification_failed: () =>
    json(403, {
      error: "verification_failed",
      message: `We couldn't verify that you're a person. Please reload the page and try again, or email Abdallah at ${FALLBACK_EMAIL}.`,
      contactEmail: FALLBACK_EMAIL,
    }),
  invalid_request: () => json(400, { error: "invalid_request" }),
  message_too_long: () => json(400, { error: "message_too_long" }),
};

export const streamError = {
  message: `Tom can't answer right now. Please email Abdallah at ${FALLBACK_EMAIL}.`,
  contactEmail: FALLBACK_EMAIL,
};
