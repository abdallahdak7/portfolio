import type { Plugin } from "vite";
import { about } from "../src/content";

/** Fills `%about.<fact>%` in `html` from src/content.ts. An unknown fact throws, so it fails the build. */
export function fillAbout(html: string, page: string): string {
  return html.replace(/%about\.(\w+)%/g, (_, fact: string) => {
    if (!Object.hasOwn(about, fact)) throw new Error(`${page}: %about.${fact}% isn't a fact in src/content.ts`);
    return about[fact as keyof typeof about];
  });
}

/** Lets static pages such as the Privacy notice state facts about Abdallah without restating them. */
export function aboutInHtml(): Plugin {
  return {
    name: "about-in-html",
    transformIndexHtml: { order: "pre", handler: (html, { path }) => fillAbout(html, path) },
  };
}
