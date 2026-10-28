import { afterEach, describe, expect, it, vi } from "vitest";
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

function setup(...responses: (Response | Error)[]) {
  return setupWithToken(async () => "token", ...responses);
}

function setupWithToken(getTurnstileToken: () => Promise<string>, ...responses: (Response | Error)[]) {
  let humanCheckListener: (needed: boolean) => void = () => {};
  const tom = createTomClient({ baseUrl: "https://tom.test", fetch: scriptedFetch(responses), getTurnstileToken });
  const askTom = createAskTom({
    tom,
    fallbackEmail: EMAIL,
    humanCheck: {
      onInteractive: (listener) => {
        humanCheckListener = listener;
        return () => {};
      },
    },
  });
  return { askTom, humanCheckNeeded: (needed: boolean) => humanCheckListener(needed) };
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
