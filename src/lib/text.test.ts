import { describe, expect, it } from "vitest";
import { linkify } from "./text";

describe("linkify", () => {
  it("turns a URL in a Tom turn into a link", () => {
    expect(linkify("Book at https://cal.com/abdallah today")).toEqual([
      { text: "Book at " },
      { text: "https://cal.com/abdallah", href: "https://cal.com/abdallah" },
      { text: " today" },
    ]);
  });

  it("turns the Fallback email into a mailto link", () => {
    expect(linkify("Email abdallah.daknache@gmail.com.")).toEqual([
      { text: "Email " },
      { text: "abdallah.daknache@gmail.com", href: "mailto:abdallah.daknache@gmail.com" },
      { text: "." },
    ]);
  });

  it("leaves sentence punctuation and a closing bracket out of the link", () => {
    expect(linkify("(see https://cal.com/abdallah).")).toEqual([
      { text: "(see " },
      { text: "https://cal.com/abdallah", href: "https://cal.com/abdallah" },
      { text: ")." },
    ]);
  });
});
