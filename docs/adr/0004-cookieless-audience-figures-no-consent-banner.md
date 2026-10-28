# Audience figures are cookieless, so there is no consent banner

The site measures its Audience figures with Umami Cloud, which sets no cookies and stores nothing on the Visitor's device, so under the ePrivacy rules there is nothing to ask consent for and the site shows no cookie banner. The Privacy notice (`/privacy/`) discloses what is measured instead. We chose this over cookie-based analytics behind an opt-in banner because a banner that many EU Visitors decline under-counts exactly when it matters, at a launch, and adds friction for the hiring managers the site is for. The cost is that a returning Visitor can't reliably be told apart from a new one across days, which none of the Goals needs.

Every event serves a Goal, and nothing is added that doesn't. Targets are set after a two-week baseline:

- **G1 Launch reach**: Visitors whose Source is LinkedIn. LinkedIn's in-app browser often sends no referrer, so read it with direct Visitors at launch.
- **G2 Résumé interest**: Résumé downloads ÷ Visitors (`resume-download`, by `from`).
- **G3 Tom adoption**: Conversations started ÷ Visitors (`conversation-started`, once Tom first answers).
- **G4 Contact**: Booking link, email, LinkedIn or a Message through Tom (`contact`, by `via` and `from`).

Event properties are fixed values only, never anything a Visitor typed.

## Consequences

- Adding a cookie, local storage or an identifier for Visitors would bring back the need for consent; it needs a banner and a new ADR.
- Abdallah excludes his own browsers with Umami's opt-out flag (see the README); that is storage he sets on his own device.
- The Privacy notice states facts about Tom's Worker (no stored history, counts that expire within 24 hours, Messages emailed through Cloudflare, Anthropic as the model provider). A change to the Worker's data handling means a change to the notice.

## Considered Options

- **Cookie-based analytics (GA4, standard PostHog) behind an opt-in banner**: rejected for under-counting EU Visitors and adding friction.
- **Cloudflare Web Analytics**: rejected because it has no custom events, so Résumé downloads and Contacts couldn't be counted.
- **Plausible**: equally cookieless and EU-owned, but paid; switching is a one-line script change if wanted.
