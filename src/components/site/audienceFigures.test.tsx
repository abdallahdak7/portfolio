// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskTom } from "./AskTom";
import { Contact } from "./Contact";
import { Header } from "./Header";
import { Hero } from "./Hero";

// Drives the real components and the real analytics, faking only the Umami global. Dev builds drop every event,
// so these tests run as a production build would.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const umami = { track: vi.fn() };
let root: Root;
let page: HTMLElement;

/** jsdom can't navigate, so a followed link stops at the click. */
const stayOnPage = (e: Event) => e.preventDefault();

beforeEach(() => {
  vi.stubEnv("DEV", false);
  window.umami = umami;
  umami.track.mockClear();
  document.addEventListener("click", stayOnPage);
  // Ask Tom loads its Suggested questions when it scrolls near; nothing here scrolls.
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
});

afterEach(() => {
  act(() => root.unmount());
  page.remove();
  document.removeEventListener("click", stayOnPage);
  delete window.umami;
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function render(ui: ReactNode) {
  page = document.body.appendChild(document.createElement("div"));
  root = createRoot(page);
  act(() => root.render(ui));
}

function link(name: string) {
  const found = [...page.querySelectorAll("a")].find((a) => a.textContent?.trim() === name);
  if (!found) throw new Error(`no link named "${name}"`);
  return found;
}

function follow(name: string) {
  act(() => link(name).click());
}

/** Lets time pass, rendering as it goes, until `check` stops throwing. */
async function until(check: () => unknown, timeoutMs = 3000) {
  for (let waited = 0; ; waited += 50) {
    await act(() => new Promise((r) => setTimeout(r, 50)));
    try {
      return check();
    } catch (error) {
      if (waited >= timeoutMs) throw error;
    }
  }
}

describe("Header", () => {
  it("counts a Résumé download from the header", () => {
    render(<Header />);

    follow("Résumé");

    expect(umami.track.mock.calls).toEqual([["resume-download", { from: "header" }]]);
  });
});

describe("Hero", () => {
  it.each([
    ["Book a call", ["contact", { via: "booking", from: "hero" }]],
    ["Email", ["contact", { via: "email", from: "hero" }]],
    ["LinkedIn", ["contact", { via: "linkedin", from: "hero" }]],
    ["Résumé", ["resume-download", { from: "hero" }]],
  ])("counts following %s", (name, event) => {
    render(<Hero />);

    follow(name);

    expect(umami.track.mock.calls).toEqual([event]);
  });

  it("opens the Booking link in a new tab", () => {
    render(<Hero />);

    expect(link("Book a call")).toMatchObject({ href: "https://calendly.com/abdallah-daknache", target: "_blank" });
  });
});

describe("Contact section", () => {
  it.each([
    ["Book a call", ["contact", { via: "booking", from: "contact" }]],
    ["abdallah.daknache@gmail.com", ["contact", { via: "email", from: "contact" }]],
    ["LinkedIn", ["contact", { via: "linkedin", from: "contact" }]],
    ["Résumé (PDF)", ["resume-download", { from: "contact" }]],
  ])("counts following %s", (name, event) => {
    render(<Contact />);

    follow(name);

    expect(umami.track.mock.calls).toEqual([event]);
  });

  it("doesn't count following GitHub, which serves no Goal", () => {
    render(<Contact />);

    follow("GitHub");

    expect(umami.track.mock.calls).toEqual([]);
  });
});

describe("Ask Tom", () => {
  it("counts the Booking link and email links in a Notice as Contacts from Tom", async () => {
    render(<AskTom />);

    // The dev Worker answers "/limit" with the turn-limit Notice, which offers both.
    const draft = page.querySelector("textarea");
    if (!draft) throw new Error("no draft");
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(draft, "/limit");
      draft.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => draft.form?.requestSubmit());
    await until(() => link("Book a call"));
    umami.track.mockClear();

    follow("Book a call");
    follow("Email Abdallah");
    follow("https://calendly.com/abdallah-daknache");
    follow("abdallah.daknache@gmail.com");

    expect(umami.track.mock.calls).toEqual([
      ["contact", { via: "booking", from: "tom" }],
      ["contact", { via: "email", from: "tom" }],
      ["contact", { via: "booking", from: "tom" }],
      ["contact", { via: "email", from: "tom" }],
    ]);
  });
});
