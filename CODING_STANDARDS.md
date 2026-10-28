# Coding standards

Judgement calls a reviewer checks. `npm run lint` enforces the mechanical rules.

## Language

- Use the terms in `GLOSSARY.md` everywhere: code, test names, comments and Visitor-facing copy ("withdraws a refused Visitor turn").
- The Worker's wire names (such as `contactEmail`) stay inside `src/lib/tom/client.ts`, which maps them to glossary names.

## Content

- Facts about Abdallah live in `src/content.ts`. Components render them; static pages fill them in with `%about.<fact>%`. Copy that only describes an interaction may live with its component.
- Back every Confirmed fact with the Résumé or LinkedIn, and phrase an Aspiration as one ("Open to Lead roles").
- Change Experience in `resume/resume.html` too, so the site and the Résumé agree.

## Modules and seams

- Logic lives in `src/lib` as deep modules; components only render.
- Pass in anything that does I/O or touches the browser (`fetch`, Turnstile, Umami, timers), as `createTomClient` does.
- Wire the real and dev adapters in `src/lib/tom/index.ts` only.
- A seam earns its place with a second adapter: a test fake or a dev mock.

## Tom client

- Outcomes the Visitor can see are values in `TurnResult`; throw only for programmer errors.
- Narrow every Worker response at the client's edge. An unexpected shape is a `failed` turn.
- `src/lib/tom/fixtures.ts` mirrors the Worker (`docs/api.md` and `src/contact.json` in `abdallahdak7/speak-about-abdallah`).

## React

- One exported component per file in `src/components/site`, named after the Section or element it renders.
- Read state from its owner, such as a client, rather than copying it into React state.
- Announce every change the Visitor should know about in Ask Tom through the live region.

## Styling and accessibility

- Colour with the theme tokens in `src/theme.css`, so light and dark mode both work.
- Gate motion and pointer effects on `prefers-reduced-motion` and `pointer: fine`.
- Give icon-only controls an accessible name, and mark decorative icons `aria-hidden`.

## Dependencies

- The runtime dependencies are React and the icon set (ADR-0002); the platform does the rest.

## Tests

- Test through a module's interface, faking only the system edge (`fetch`, `window.turnstile`, `window.umami`, speech recognition, time) and driving our own modules for real.
- Take expected values from a literal, a fixture or the API contract.
