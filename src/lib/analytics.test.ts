import { describe, expect, it, vi } from "vitest";
import { contactVia, createAnalytics } from "./analytics";

describe("createAnalytics", () => {
  it("sends each Goal event with its fixed properties", () => {
    const umami = { track: vi.fn() };
    const analytics = createAnalytics(() => umami);

    analytics.resumeDownload("hero");
    analytics.contact("booking", "contact");
    analytics.conversationStarted();

    expect(umami.track.mock.calls).toEqual([
      ["resume-download", { from: "hero" }],
      ["contact", { via: "booking", from: "contact" }],
      ["conversation-started", {}],
    ]);
  });

  it("drops events while Umami hasn't loaded, and sends once it has", () => {
    const umami = { track: vi.fn() };
    const page: { umami?: typeof umami } = {};
    const analytics = createAnalytics(() => page.umami);

    analytics.resumeDownload("header");
    page.umami = umami;
    analytics.resumeDownload("contact");

    expect(umami.track.mock.calls).toEqual([["resume-download", { from: "contact" }]]);
  });

  it("never lets a failing Umami break the page", () => {
    const analytics = createAnalytics(() => ({
      track() {
        throw new Error("blocked");
      },
    }));

    expect(() => analytics.contact("email", "hero")).not.toThrow();
  });
});

describe("contactVia", () => {
  it("names the Contact a link makes", () => {
    expect(contactVia("mailto:abdallah.daknache@gmail.com")).toBe("email");
    expect(contactVia("https://calendly.com/abdallah-daknache")).toBe("booking");
    expect(contactVia("https://calendly.com/abdallah-daknache/30min")).toBe("booking");
    expect(contactVia("https://www.linkedin.com/in/abdallah-daknache/")).toBe("linkedin");
  });

  it("makes no Contact for other links", () => {
    expect(contactVia("https://github.com/abdallahdak7")).toBeNull();
  });
});
