import { afterEach, describe, expect, it, vi } from "vitest";
import { about } from "@/content";
import type { SpeechRecognition } from "@/lib/speech";
import { createAnalytics } from "@/lib/analytics";
import { createAskTom } from "./askTom";
import { createTomClient } from "./client";
import { BOOKING_LINK, eventStream, json, rejections, streamError, type StreamEvent } from "./fixtures";

const ID = "11111111-1111-4111-8111-111111111111";
const EMAIL = "abdallah.daknache@gmail.com";

/** Answers each request with the next scripted response, like the Worker would. */
function scriptedFetch(responses: (Response | Error)[]): typeof fetch {
  return async () => {
    const next = responses.shift();
    if (!next) throw new Error("unexpected request");
    if (next instanceof Error) throw next;
    return next;
  };
}

const reply = (...parts: string[]): StreamEvent[] => [
  ...parts.map((text) => ({ event: "text_delta", data: { text } })),
  { event: "done", data: {} },
];

/** A fake browser speech recognition. Each `new` is kept in `instances`, so a test can speak into the latest. */
function fakeSpeechRecognition() {
  const instances: FakeRecognition[] = [];
  class FakeRecognition implements SpeechRecognition {
    continuous = true;
    interimResults = false;
    onresult: SpeechRecognition["onresult"] = null;
    onerror: SpeechRecognition["onerror"] = null;
    onend: SpeechRecognition["onend"] = null;
    started = false;
    constructor() {
      instances.push(this);
    }
    start() {
      this.started = true;
    }
    stop() {
      this.onend?.();
    }
    abort() {
      this.onerror?.({ error: "aborted" });
      this.onend?.();
    }
    /** Delivers everything heard so far, one phrase per string. */
    hear(...phrases: string[]) {
      this.onresult?.({ results: phrases.map((transcript) => [{ transcript }]) });
    }
    fail(error: string) {
      this.onerror?.({ error });
      this.onend?.();
    }
  }
  return { SpeechRecognition: FakeRecognition, latest: () => instances[instances.length - 1] };
}

function setupWithSpeech(...responses: (Response | Error)[]) {
  const speech = fakeSpeechRecognition();
  const tom = createTomClient({ baseUrl: "https://tom.test", fetch: scriptedFetch(responses), getTurnstileToken: async () => "token" });
  const askTom = createAskTom({
    tom,
    fallbackEmail: EMAIL,
    bookingLink: about.bookingLink,
    analytics: createAnalytics(() => undefined),
    humanCheck: { onInteractive: () => () => {} },
    speechRecognition: speech.SpeechRecognition,
  });
  return { askTom, speech };
}

function setup(...responses: (Response | Error)[]) {
  return setupWithToken(async () => "token", ...responses);
}

function setupWithToken(getTurnstileToken: () => Promise<string>, ...responses: (Response | Error)[]) {
  let humanCheckListener: (needed: boolean) => void = () => {};
  const umami = { track: vi.fn() };
  const tom = createTomClient({ baseUrl: "https://tom.test", fetch: scriptedFetch(responses), getTurnstileToken });
  const askTom = createAskTom({
    tom,
    fallbackEmail: EMAIL,
    bookingLink: about.bookingLink,
    analytics: createAnalytics(() => umami),
    humanCheck: {
      onInteractive: (listener) => {
        humanCheckListener = listener;
        return () => {};
      },
    },
  });
  return { askTom, humanCheckNeeded: (needed: boolean) => humanCheckListener(needed), tracked: () => umami.track.mock.calls };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Ask Tom", () => {
  it("shows the Visitor turn and Tom's streamed reply", async () => {
    const { askTom } = setup(eventStream(reply("Abdallah is ", "a mobile engineer."), ID));
    askTom.setDraft("What does he do?");

    await askTom.send("What does he do?");

    expect(askTom.getState()).toMatchObject({
      turns: [
        { role: "visitor", text: "What does he do?", streaming: false },
        { role: "tom", text: "Abdallah is a mobile engineer.", streaming: false },
      ],
      draft: "",
      busy: false,
      notice: null,
    });
  });

  it("withdraws a refused Visitor turn and returns its text to the draft", async () => {
    const { askTom } = setup(rejections.invalid_request());

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      turns: [],
      draft: "hi",
      notice: {
        message: `Tom couldn't take that question. Try asking it another way, more briefly, or email Abdallah at ${EMAIL}.`,
        fallbackEmail: EMAIL,
      },
    });
  });

  it("is Paused after too many questions, until Retry-After has passed", async () => {
    vi.useFakeTimers();
    const { askTom } = setup(rejections.rate_limited());

    await askTom.send("hi");
    expect(askTom.getState()).toMatchObject({
      paused: true,
      accepting: false,
      canSend: false,
      notice: { message: expect.stringContaining("Too many questions"), fallbackEmail: EMAIL },
    });

    await vi.advanceTimersByTimeAsync(29_000);
    expect(askTom.getState().paused).toBe(true);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(askTom.getState()).toMatchObject({ paused: false, accepting: true, canSend: true });
  });

  it("is Ended at the turn limit, offering the Booking link, and sends nothing more", async () => {
    const { askTom } = setup(rejections.turn_limit_reached());

    await askTom.send("hi");
    await askTom.send("still there?");

    expect(askTom.getState()).toMatchObject({
      ended: true,
      accepting: false,
      canSend: false,
      turns: [],
      notice: { message: expect.stringContaining("reached its limit"), bookingLink: BOOKING_LINK, fallbackEmail: EMAIL },
    });
  });

  it("is Ended when the Visitor can't be verified", async () => {
    const { askTom } = setup(rejections.verification_failed(), rejections.verification_failed());

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      ended: true,
      notice: { message: expect.stringContaining("reload the page"), fallbackEmail: EMAIL },
    });
  });

  it("loads the Suggested questions only once", async () => {
    const { askTom } = setup(json(200, { questions: ["What does he build?", "Is he open to Lead roles?"] }));

    await Promise.all([askTom.loadSuggestions(), askTom.loadSuggestions()]);
    await askTom.loadSuggestions();

    expect(askTom.getState().suggestedQuestions).toEqual(["What does he build?", "Is he open to Lead roles?"]);
  });

  it("takes no Suggested question while a Visitor turn is on its way", async () => {
    const { askTom } = setup(eventStream(reply("Hi."), ID));

    const sending = askTom.send("hi");
    expect(askTom.getState()).toMatchObject({ busy: true, accepting: false });
    await sending;
    expect(askTom.getState().accepting).toBe(true);
  });

  it("sends a quick double submit only once", async () => {
    const { askTom } = setup(eventStream(reply("Once."), ID));

    await Promise.all([askTom.send("hi"), askTom.send("hi")]);

    expect(askTom.getState().turns.map((t) => t.text)).toEqual(["hi", "Once."]);
  });

  it("keeps what Tom had said when the stream stops partway", async () => {
    const { askTom } = setup(eventStream([{ event: "text_delta", data: { text: "Abdallah is" } }], ID));

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      turns: [
        { role: "visitor", text: "hi" },
        { role: "tom", text: "Abdallah is", streaming: false },
      ],
      notice: { message: expect.stringContaining("Tom can't be reached right now"), fallbackEmail: EMAIL },
    });
  });

  it("withdraws the Visitor turn when Tom can't be reached at all", async () => {
    const { askTom } = setup(new TypeError("offline"));

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      turns: [],
      draft: "hi",
      notice: {
        message: `Tom can't be reached right now. Check your connection and try again, or email Abdallah at ${EMAIL}.`,
      },
    });
  });

  it("keeps the Visitor turn but drops Tom's empty reply when Tom errors", async () => {
    const { askTom } = setup(eventStream([{ event: "error", data: streamError }], ID));

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      turns: [{ role: "visitor", text: "hi" }],
      draft: "",
      notice: { message: streamError.message, fallbackEmail: EMAIL },
    });
  });

  it("withdraws the Visitor turn when the Human check can't be passed", async () => {
    const { askTom } = setupWithToken(async () => {
      throw new Error("challenge failed");
    });

    await askTom.send("hi");

    expect(askTom.getState()).toMatchObject({
      turns: [],
      draft: "hi",
      ended: false,
      notice: { message: expect.stringContaining("quick check that you're human"), fallbackEmail: EMAIL },
    });
  });

  it("reports the progress of a Message for Abdallah", async () => {
    const { askTom } = setup(
      eventStream(
        [
          { event: "tool_status", data: { status: "sending_message" } },
          { event: "tool_status", data: { status: "message_not_sent" } },
          ...reply("Sorry."),
        ],
        ID,
      ),
    );

    await askTom.send("Pass this on");

    expect(askTom.getState().messageProgress).toEqual({
      status: "message_not_sent",
      text: `Your message didn't go through. You can email Abdallah at ${EMAIL}.`,
    });
  });

  it("asks the Visitor to tick the box while the Human check needs them", () => {
    const { askTom, humanCheckNeeded } = setup();

    humanCheckNeeded(true);
    expect(askTom.getState()).toMatchObject({
      humanCheckNeeded: true,
      announcement: "Tick the box below so Tom can answer.",
    });

    humanCheckNeeded(false);
    expect(askTom.getState().humanCheckNeeded).toBe(false);
  });

  it("announces Tom's reply", async () => {
    const { askTom } = setup(eventStream(reply("He builds apps."), ID));
    await askTom.send("hi");
    expect(askTom.getState().announcement).toBe("Tom: He builds apps.");
  });

  it("announces a Notice", async () => {
    const { askTom } = setup(rejections.rate_limited());
    await askTom.send("hi");
    expect(askTom.getState().announcement).toContain("Too many questions");
  });

  it("announces that Tom is replying, then each step of a Message", async () => {
    const { askTom } = setup(eventStream([{ event: "tool_status", data: { status: "sending_message" } }, ...reply("Sent.")], ID));
    const announced: string[] = [];
    askTom.subscribe(() => {
      const { announcement } = askTom.getState();
      if (announced.at(-1) !== announcement) announced.push(announcement);
    });

    await askTom.send("Pass this on");

    expect(announced).toEqual(["Tom is replying…", "Passing your message to Abdallah…", "Tom: Sent."]);
  });
});

describe("Audience figures", () => {
  it("counts a Conversation as started once Tom first answers, however many Exchanges follow", async () => {
    const { askTom, tracked } = setup(eventStream(reply("He's a mobile engineer."), ID), eventStream(reply("At Pepperstone."), ID));

    await askTom.send("What does he do?");
    await askTom.send("Where?");

    expect(tracked()).toEqual([["conversation-started", {}]]);
  });

  it("doesn't count a Conversation Tom never answered in", async () => {
    const refused = setup(rejections.invalid_request());
    const paused = setup(rejections.rate_limited());
    const unverified = setupWithToken(async () => {
      throw new Error("challenge failed");
    });

    for (const { askTom } of [refused, paused, unverified]) await askTom.send("hi");

    expect([refused.tracked(), paused.tracked(), unverified.tracked()]).toEqual([[], [], []]);
  });

  it("counts a sent Message as a Contact from Tom", async () => {
    const { askTom, tracked } = setup(
      eventStream(
        [
          { event: "tool_status", data: { status: "sending_message" } },
          { event: "tool_status", data: { status: "message_sent" } },
          ...reply("Done."),
        ],
        ID,
      ),
    );

    await askTom.send("Tell him Jane from Acme wants to talk");

    expect(tracked()).toContainEqual(["contact", { via: "tom-message", from: "tom" }]);
  });

  it("doesn't count a Message that didn't go through", async () => {
    const { askTom, tracked } = setup(
      eventStream([{ event: "tool_status", data: { status: "message_not_sent" } }, ...reply("Sorry.")], ID),
    );

    await askTom.send("Pass this on");

    expect(tracked()).not.toContainEqual(expect.arrayContaining(["contact"]));
  });

  it("counts a Booking link or email link followed in Ask Tom as a Contact from Tom", () => {
    const { askTom, tracked } = setup();

    askTom.followLink(BOOKING_LINK);
    askTom.followLink(`mailto:${EMAIL}`);

    expect(tracked()).toEqual([
      ["contact", { via: "booking", from: "tom" }],
      ["contact", { via: "email", from: "tom" }],
    ]);
  });

  it("counts the Booking link Tom offers in a Notice as a Contact from Tom", async () => {
    const { askTom, tracked } = setup(rejections.turn_limit_reached());

    await askTom.send("hi");
    askTom.followLink(askTom.getState().notice?.bookingLink ?? "");

    expect(tracked()).toEqual([["contact", { via: "booking", from: "tom" }]]);
  });

  it("doesn't count other links followed in Ask Tom", () => {
    const { askTom, tracked } = setup();

    askTom.followLink("https://github.com/abdallahdak7");

    expect(tracked()).toEqual([]);
  });

  it("never sends what the Visitor wrote", async () => {
    const visitorTurn = "Tell him Jane from Acme wants to talk";
    const { askTom, tracked } = setup(
      eventStream([{ event: "tool_status", data: { status: "message_sent" } }, ...reply("Done.")], ID),
    );

    await askTom.send(visitorTurn);

    expect(tracked()).not.toEqual([]);
    for (const call of tracked()) expect(JSON.stringify(call)).not.toContain(visitorTurn);
  });
});

describe("Dictation", () => {
  it("is unsupported where the browser has no speech recognition", () => {
    const { askTom } = setup();

    askTom.startDictation();

    expect(askTom.getState().dictation).toBe("unsupported");
  });

  it("writes what the Visitor says into the draft as it's heard, without sending", async () => {
    const { askTom, speech } = setupWithSpeech();

    askTom.startDictation();
    expect(askTom.getState()).toMatchObject({ dictation: "listening", announcement: "Listening…" });
    expect(speech.latest()).toMatchObject({ started: true, continuous: false, interimResults: true });

    speech.latest().hear("what does");
    expect(askTom.getState().draft).toBe("what does");
    speech.latest().hear("what does he build");
    speech.latest().stop();

    expect(askTom.getState()).toMatchObject({
      draft: "what does he build",
      dictation: "off",
      announcement: "Stopped listening.",
      turns: [],
      canSend: true,
    });
  });

  it("adds what's heard after what the Visitor already typed", () => {
    const { askTom, speech } = setupWithSpeech();
    askTom.setDraft("Hi Tom. ");

    askTom.startDictation();
    speech.latest().hear("what does he build");

    expect(askTom.getState().draft).toBe("Hi Tom. what does he build");
  });

  it("keeps the draft within the Visitor turn limit", () => {
    const { askTom, speech } = setupWithSpeech();

    askTom.startDictation();
    speech.latest().hear("a".repeat(450));

    expect(askTom.getState().draft).toHaveLength(400);
  });

  it("stops when the Visitor types, so nothing heard later overwrites the typing", () => {
    const { askTom, speech } = setupWithSpeech();
    askTom.startDictation();
    speech.latest().hear("what does");
    const dictating = speech.latest();

    askTom.setDraft("what does he do?");
    dictating.hear("what does he build");

    expect(askTom.getState()).toMatchObject({ draft: "what does he do?", dictation: "off" });
  });

  it("stops when the Visitor sends, so nothing heard late lands in the next draft", async () => {
    const { askTom, speech } = setupWithSpeech(eventStream(reply("He builds apps."), ID));
    askTom.startDictation();
    const dictating = speech.latest();
    dictating.hear("what does he build");

    await askTom.send(askTom.getState().draft);
    dictating.hear("what does he build for fun");

    expect(askTom.getState()).toMatchObject({ draft: "", dictation: "off" });
    expect(askTom.getState().turns.map((t) => t.text)).toEqual(["what does he build", "He builds apps."]);
  });

  it("says why when the microphone is blocked, and leaves the draft alone", () => {
    const { askTom, speech } = setupWithSpeech();
    askTom.setDraft("typed so far");

    askTom.startDictation();
    speech.latest().fail("not-allowed");

    const problem = "Microphone access is blocked. Allow it in your browser to speak your question, or type it.";
    expect(askTom.getState()).toMatchObject({
      draft: "typed so far",
      dictation: "off",
      dictationProblem: problem,
      announcement: problem,
    });
  });

  it("clears the last problem when the Visitor tries again", () => {
    const { askTom, speech } = setupWithSpeech();
    askTom.startDictation();
    speech.latest().fail("no-speech");

    askTom.startDictation();

    expect(askTom.getState()).toMatchObject({ dictation: "listening", dictationProblem: null });
  });

  it("doesn't listen once the Conversation is Ended", async () => {
    const { askTom, speech } = setupWithSpeech(rejections.turn_limit_reached());
    await askTom.send("hi");

    askTom.startDictation();

    expect(askTom.getState().dictation).toBe("off");
    expect(speech.latest()).toBeUndefined();
  });
});
