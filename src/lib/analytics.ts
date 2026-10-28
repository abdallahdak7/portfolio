// Audience figures, sent to Umami (docs/adr/0004). Every event here serves a Goal, and its properties are
// fixed values, so nothing a Visitor typed can be sent.
// https://umami.is/docs/tracker-functions

type UmamiApi = { track(event: string, data: Record<string, string>): unknown };

declare global {
  interface Window {
    umami?: UmamiApi;
  }
}

/** Where a Résumé download was clicked: the header, the Hero or the Contact section. */
export type ResumeFrom = "header" | "hero" | "contact";
/** How a Visitor reached out. */
export type ContactVia = "booking" | "email" | "linkedin" | "tom-message";
/** Where on the site a Contact happened: the Hero, the Contact section (`contact`) or Ask Tom. */
export type ContactFrom = "hero" | "contact" | "tom";

export type Analytics = {
  /** G2 Résumé interest. */
  resumeDownload(from: ResumeFrom): void;
  /** G4 Contact. */
  contact(via: ContactVia, from: ContactFrom): void;
  /** G3 Tom adoption: Tom has answered in a Conversation for the first time. */
  conversationStarted(): void;
};

/**
 * `getUmami` is read on every event, since the script loads after the page. Without it (dev, or the script was
 * blocked) events are dropped, and a failing script never breaks the site.
 */
export function createAnalytics(getUmami: () => UmamiApi | undefined): Analytics {
  const track = (event: string, data: Record<string, string> = {}) => {
    try {
      getUmami()?.track(event, data);
    } catch {
      // Audience figures are never worth a broken page.
    }
  };
  return {
    resumeDownload: (from) => track("resume-download", { from }),
    contact: (via, from) => track("contact", { via, from }),
    conversationStarted: () => track("conversation-started"),
  };
}
