import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { fillAbout } from "./aboutInHtml";

const privacyNotice = () => fillAbout(readFileSync(path.resolve(__dirname, "../privacy/index.html"), "utf8"), "/privacy/index.html");

describe("fillAbout", () => {
  it("fills each fact about Abdallah from the site's content", () => {
    expect(fillAbout("<p>%about.name%, %about.location%</p>", "/page.html")).toBe("<p>Abdallah Daknache, Limassol, Cyprus</p>");
  });

  it("fails the build on a fact the site's content doesn't have", () => {
    expect(() => fillAbout("<p>%about.phone%</p>", "/page.html")).toThrow("/page.html: %about.phone% isn't a fact in src/content.ts");
  });
});

describe("Privacy notice", () => {
  it("names Abdallah as responsible for the data, with where he is and how to reach him", () => {
    const html = privacyNotice();

    expect(html).toContain("Abdallah Daknache, Limassol, Cyprus, is responsible for this site");
    expect(html).toContain('<a href="mailto:abdallah.daknache@gmail.com">abdallah.daknache@gmail.com</a>');
    expect(html).toContain("<title>Privacy notice — Abdallah Daknache</title>");
  });

  it("leaves no fact unfilled", () => {
    expect(privacyNotice()).not.toContain("%about.");
  });
});
