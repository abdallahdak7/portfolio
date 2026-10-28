/** Prevent awkward line breaks inside compounds like "AI-first" or ranges like "20–30". */
export const keepTogether = (s: string) => s.replace(/([\w+])([-–])(?=\w)/g, "$1⁠$2⁠");

export type TextPart = { text: string; href?: string };

const LINK = /(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"]|[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,})/gi;

/** Splits plain text into text and links, so URLs and email addresses in a Tom turn or a Notice can be followed. */
export function linkify(text: string): TextPart[] {
  return text
    .split(LINK)
    .map((part, i) => {
      if (i % 2 === 0) return { text: part };
      return { text: part, href: /^https?:/i.test(part) ? part : `mailto:${part}` };
    })
    .filter((p) => p.text !== "");
}
