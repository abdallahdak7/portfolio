// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskTom } from "./AskTom";

// Drives the real component against the dev Worker (src/lib/tom/mock.ts), on fake time.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let page: HTMLElement;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  // Ask Tom loads its Suggested questions when it scrolls near; nothing here scrolls.
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  page = document.body.appendChild(document.createElement("div"));
  root = createRoot(page);
  act(() => root.render(<AskTom />));
});

afterEach(() => {
  act(() => root.unmount());
  page.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Moves time on, rendering as it goes, until `check` stops throwing. */
async function until(check: () => unknown, timeoutMs = 10_000) {
  for (let waited = 0; ; waited += 50) {
    await act(() => vi.advanceTimersByTimeAsync(50));
    try {
      return check();
    } catch (error) {
      if (waited >= timeoutMs) throw error;
    }
  }
}

function ask(question: string) {
  const draft = page.querySelector("textarea");
  if (!draft) throw new Error("no draft");
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(draft, question);
    draft.dispatchEvent(new Event("input", { bubbles: true }));
  });
  act(() => draft.form?.requestSubmit());
}

const tomTurn = () => [...page.querySelectorAll("li")].at(-1)?.textContent ?? "";
const conversation = () => page.querySelector('[aria-label="Conversation with Tom"]');
const transcript = () => conversation()?.textContent ?? "";

describe("Ask Tom", () => {
  it("shows a Profile lookup outside Tom's reply, even partway through it", async () => {
    // The dev Worker answers "/lookup" with a Profile lookup before the reply and another partway through.
    ask("What does he do? /lookup");

    await until(() => {
      expect(tomTurn()).not.toContain("Thinking…");
      expect(tomTurn()).toMatch(/Tom: \w/);
      expect(transcript()).toContain("Checking Abdallah's profile…");
    });
    expect(tomTurn()).not.toContain("Checking");

    await until(() => expect(conversation()?.getAttribute("aria-busy")).toBe("false"));
    expect(transcript()).not.toContain("Checking");
  });
});
