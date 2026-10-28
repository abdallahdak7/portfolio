import { describe, expect, it, vi } from "vitest";
import { createTomClient, type ToolStatus } from "./client";
import { eventStream, json, rejections, streamError, type StreamEvent } from "./fixtures";

const BASE = "https://tom.test";
const ID_1 = "11111111-1111-4111-8111-111111111111";
const ID_2 = "22222222-2222-4222-8222-222222222222";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- request bodies are asserted field by field
type Call = { url: string; method: string; body: any };

/** A fake fetch that answers each call with the next scripted response and records what was sent. */
function fakeFetch(...responses: (Response | Error)[]) {
  const calls: Call[] = [];
  const fetch = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const next = responses.shift();
    if (!next) throw new Error("unexpected request");
    if (next instanceof Error) throw next;
    return next;
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

function tokens() {
  let n = 0;
  return vi.fn(async () => `token-${++n}`);
}

const reply = (...parts: string[]): StreamEvent[] => [
  ...parts.map((text) => ({ event: "text_delta", data: { text } })),
  { event: "done", data: {} },
];

function setup(...responses: (Response | Error)[]) {
  const { fetch, calls } = fakeFetch(...responses);
  const getTurnstileToken = tokens();
  const client = createTomClient({ baseUrl: BASE, fetch, getTurnstileToken });
  return { client, calls, getTurnstileToken };
}

describe("getSuggestions", () => {
  it("returns at most three Suggested questions", async () => {
    const { client, calls } = setup(json(200, { questions: ["a", "b", "c", "d"] }));
    expect(await client.getSuggestions()).toEqual(["a", "b", "c"]);
    expect(calls[0].url).toBe(`${BASE}/suggestions`);
  });

  it("returns no questions when the request fails", async () => {
    const { client } = setup(new TypeError("offline"));
    expect(await client.getSuggestions()).toEqual([]);
  });
});

describe("sendTurn", () => {
  it("opens a Conversation with a Turnstile token and streams Tom's reply", async () => {
    const { client, calls } = setup(eventStream(reply("Abdallah is ", "a mobile engineer."), ID_1));
    const conversation = client.startConversation();
    const texts: string[] = [];

    const result = await conversation.sendTurn("  What does he do?  ", { onText: (t) => texts.push(t) });

    expect(result).toEqual({ kind: "done", reply: "Abdallah is a mobile engineer." });
    expect(texts).toEqual(["Abdallah is ", "a mobile engineer."]);
    expect(calls[0]).toEqual({
      url: `${BASE}/chat`,
      method: "POST",
      body: { history: [], message: "What does he do?", turnstileToken: "token-1" },
    });
  });

  it("sends follow-ups with the history and Conversation-Id, without a token", async () => {
    const { client, calls, getTurnstileToken } = setup(
      eventStream(reply("First."), ID_1),
      eventStream(reply("Second."), ID_1),
    );
    const conversation = client.startConversation();
    await conversation.sendTurn("one");
    await conversation.sendTurn("two");

    expect(calls[1].body).toEqual({
      history: [
        { role: "visitor", text: "one" },
        { role: "tom", text: "First." },
      ],
      message: "two",
      conversationId: ID_1,
    });
    expect(getTurnstileToken).toHaveBeenCalledTimes(1);
  });

  it("replaces the stored Conversation-Id when the server returns a new one", async () => {
    const { client, calls } = setup(
      eventStream(reply("a"), ID_1),
      eventStream(reply("b"), ID_2),
      eventStream(reply("c"), ID_2),
    );
    const conversation = client.startConversation();
    await conversation.sendTurn("1");
    await conversation.sendTurn("2");
    await conversation.sendTurn("3");
    expect(calls[2].body.conversationId).toBe(ID_2);
  });

  it("reports Message progress from tool_status events", async () => {
    const { client } = setup(
      eventStream(
        [
          { event: "tool_status", data: { status: "sending_message" } },
          { event: "tool_status", data: { status: "message_sent" } },
          ...reply("Sent."),
        ],
        ID_1,
      ),
    );
    const statuses: ToolStatus[] = [];
    await client.startConversation().sendTurn("Pass this on", { onToolStatus: (s) => statuses.push(s) });
    expect(statuses).toEqual(["sending_message", "message_sent"]);
  });

  it("ignores an unknown tool_status", async () => {
    const { client } = setup(eventStream([{ event: "tool_status", data: { status: "launching" } }, ...reply("ok")], ID_1));
    const statuses: ToolStatus[] = [];
    await client.startConversation().sendTurn("hi", { onToolStatus: (s) => statuses.push(s) });
    expect(statuses).toEqual([]);
  });

  it("closes the response stream once Tom's reply is done", async () => {
    const cancel = vi.fn();
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      },
      cancel,
    });
    const { client } = setup(new Response(body, { headers: { "Conversation-Id": ID_1 } }));
    await client.startConversation().sendTurn("hi");
    expect(cancel).toHaveBeenCalled();
  });

  it("returns a stream error with the partial reply, and leaves it out of history", async () => {
    const { client, calls } = setup(
      eventStream([{ event: "text_delta", data: { text: "Abdal" } }, { event: "error", data: streamError }], ID_1),
      eventStream(reply("ok"), ID_1),
    );
    const conversation = client.startConversation();

    expect(await conversation.sendTurn("hi")).toEqual({
      kind: "error",
      partialReply: "Abdal",
      message: streamError.message,
      fallbackEmail: streamError.contactEmail,
    });

    await conversation.sendTurn("again");
    expect(calls[1].body.history).toEqual([]);
    expect(calls[1].body.conversationId).toBe(ID_1);
  });

  it("fails when the stream closes without done or error", async () => {
    const { client } = setup(eventStream([{ event: "text_delta", data: { text: "Abd" } }], ID_1));
    expect(await client.startConversation().sendTurn("hi")).toEqual({ kind: "failed", partialReply: "Abd" });
  });

  it("fails when the network is down or the response is unexpected", async () => {
    const { client } = setup(new TypeError("offline"), new Response("Forbidden", { status: 403 }));
    const conversation = client.startConversation();
    expect(await conversation.sendTurn("hi")).toEqual({ kind: "failed", partialReply: "" });
    expect(await conversation.sendTurn("hi")).toEqual({ kind: "failed", partialReply: "" });
  });

  it("fails when the stream goes quiet for too long", async () => {
    const { fetch } = fakeFetch(
      eventStream([{ event: "text_delta", data: { text: "Abd" } }, { event: "done", data: {}, delayMs: 200 }], ID_1),
    );
    const client = createTomClient({ baseUrl: BASE, fetch, getTurnstileToken: tokens(), idleTimeoutMs: 20 });
    expect(await client.startConversation().sendTurn("hi")).toEqual({ kind: "failed", partialReply: "Abd" });
  });

  it("fails without a request when no Turnstile token can be had", async () => {
    const { fetch, calls } = fakeFetch();
    const client = createTomClient({
      baseUrl: BASE,
      fetch,
      getTurnstileToken: async () => {
        throw new Error("challenge failed");
      },
    });
    expect(await client.startConversation().sendTurn("hi")).toEqual({ kind: "failed", partialReply: "" });
    expect(calls).toHaveLength(0);
  });

  describe("rejections", () => {
    it("returns rate_limited with Retry-After", async () => {
      const { client } = setup(rejections.rate_limited());
      expect(await client.startConversation().sendTurn("hi")).toMatchObject({
        kind: "rejected",
        error: "rate_limited",
        message: expect.stringContaining("Too many questions"),
        fallbackEmail: "abdallah.daknache@gmail.com",
        retryAfterSeconds: 30,
      });
    });

    it("returns turn_limit_reached with the Booking link", async () => {
      const { client } = setup(rejections.turn_limit_reached());
      expect(await client.startConversation().sendTurn("hi")).toMatchObject({
        kind: "rejected",
        error: "turn_limit_reached",
        bookingLink: expect.stringContaining("https://"),
        fallbackEmail: "abdallah.daknache@gmail.com",
      });
    });

    it("retries verification_failed once with a fresh token", async () => {
      const { client, calls } = setup(rejections.verification_failed(), eventStream(reply("ok"), ID_1));
      expect(await client.startConversation().sendTurn("hi")).toEqual({ kind: "done", reply: "ok" });
      expect(calls.map((c) => c.body.turnstileToken)).toEqual(["token-1", "token-2"]);
    });

    it("retries a follow-up with an expired Conversation, keeping its history", async () => {
      const { client, calls } = setup(
        eventStream(reply("a"), ID_1),
        rejections.verification_failed(),
        eventStream(reply("b"), ID_2),
        eventStream(reply("c"), ID_2),
      );
      const conversation = client.startConversation();
      await conversation.sendTurn("1");
      await conversation.sendTurn("2");
      await conversation.sendTurn("3");

      expect(calls[1].body).toMatchObject({ conversationId: ID_1 });
      expect(calls[1].body.turnstileToken).toBeUndefined();
      expect(calls[2].body).toMatchObject({ conversationId: ID_1, turnstileToken: "token-2", message: "2" });
      expect(calls[2].body.history).toHaveLength(2);
      expect(calls[3].body.conversationId).toBe(ID_2);
    });

    it("stops after a second verification_failed", async () => {
      const { client, calls } = setup(rejections.verification_failed(), rejections.verification_failed());
      expect(await client.startConversation().sendTurn("hi")).toMatchObject({
        kind: "rejected",
        error: "verification_failed",
        message: expect.stringContaining("reload"),
      });
      expect(calls).toHaveLength(2);
    });

    it("returns invalid_request and message_too_long as rejections", async () => {
      const { client } = setup(rejections.invalid_request(), rejections.message_too_long());
      const conversation = client.startConversation();
      expect(await conversation.sendTurn("hi")).toMatchObject({ kind: "rejected", error: "invalid_request" });
      expect(await conversation.sendTurn("hi")).toMatchObject({ kind: "rejected", error: "message_too_long" });
    });
  });

  describe("client-side validation", () => {
    it("refuses a blank or over-long Visitor turn without a request", async () => {
      const { client, calls } = setup();
      const conversation = client.startConversation();
      expect(await conversation.sendTurn("   ")).toEqual({ kind: "invalid", reason: "blank" });
      expect(await conversation.sendTurn("x".repeat(401))).toEqual({ kind: "invalid", reason: "too_long" });
      expect(calls).toHaveLength(0);
    });

    it("sends at most the last 16 history entries, starting on a Visitor turn", async () => {
      const responses = Array.from({ length: 10 }, (_, i) => eventStream(reply(`r${i}`), ID_1));
      const { client, calls } = setup(...responses);
      const conversation = client.startConversation();
      for (let i = 0; i < 10; i++) await conversation.sendTurn(`q${i}`);

      const last = calls[9].body.history;
      expect(last).toHaveLength(16);
      expect(last[0]).toEqual({ role: "visitor", text: "q1" });
    });

    it("caps a Tom turn in history at 2,000 characters", async () => {
      const { client, calls } = setup(eventStream(reply("y".repeat(2100)), ID_1), eventStream(reply("ok"), ID_1));
      const conversation = client.startConversation();
      await conversation.sendTurn("1");
      await conversation.sendTurn("2");
      expect(calls[1].body.history[1].text).toHaveLength(2000);
    });
  });
});
