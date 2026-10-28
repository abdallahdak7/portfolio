# Coding standards

Judgement calls a reviewer checks. Mechanical rules (no default exports, no `enum`, `import type`, no non-null `!`) are enforced by `npm run lint`, not listed here.

## Language

- Name things with the terms in `GLOSSARY.md`, in code, tests, comments and Visitor-facing copy. Use a Visitor turn, the Fallback email or a Notice, not "user message", "contact email" or "error banner".
- The Worker's wire names (such as `contactEmail`) stay inside `src/lib/tom/client.ts`. Map them to glossary names there; nothing past the client sees a wire shape.

## Content

- Facts about Abdallah live in `src/content.ts`. Components render them; they don't restate them. Copy that only describes an interaction (a loading label, a Human check prompt) may live with its component.
- Every Confirmed fact must be backed by the Résumé or LinkedIn. No numbers, titles or outcomes that aren't there.
- Never present an Aspiration as a Confirmed fact or a commitment ("Open to Lead roles", not "Lead engineer").
- A change to Experience means the same change to `resume/resume.html`, so the site and the Résumé state the same facts.

## Modules and seams

- Prefer deep modules: a lot of behaviour behind a small interface. Keep logic that isn't rendering out of components, in `src/lib`, behind an interface that tests can drive.
- Accept dependencies, don't create them: anything that does I/O or depends on the browser (`fetch`, Turnstile, timers worth testing) is passed in, as `createTomClient` and `createTurnstile` do.
- Wire up the real and dev adapters in one place (`src/lib/tom/index.ts`), not at each call site.
- Don't add a seam with only one adapter. A second adapter, whether a test fake or a dev mock, is what earns it.

## Tom client

- Outcomes the Visitor can see are returned as values in a discriminated union (`TurnResult`), never thrown. Throw only for programmer errors.
- Treat every Worker response as untrusted: narrow it at the edge of the client before using it. A response shaped in any way we don't expect is a `failed` turn, not a crash.
- Keep `src/lib/tom/fixtures.ts` in line with `docs/api.md` in `abdallahdak7/speak-about-abdallah`. The tests and the dev mock both use it, so it is the client's picture of the contract.

## React

- Components are named after the Section or element they render, one exported component per file in `src/components/site`.
- Each piece of state has one owner. Don't mirror a client's state into React state when you can read it from the client.
- Every state change the Visitor should know about in Ask Tom (Tom replying, a Notice, the Human check) is also announced through the live region.

## Styling and accessibility

- Use the theme tokens (`background`, `surface`, `foreground`, `muted`, `subtle`, `border`, `accent`) instead of raw colours, so light and dark mode both work.
- Motion and pointer effects respect `prefers-reduced-motion` and `pointer: fine`.
- Icon-only controls carry an accessible name, and decorative icons are `aria-hidden`.

## Dependencies

- Add a runtime dependency only when the platform can't reasonably do the job. Today there are two: React and the icon set (see ADR-0002).

## Tests

- Test only at agreed seams, through the module's interface. If a test has to change when the implementation changes but the behaviour doesn't, it is testing past the interface.
- Fake only at the system edge (`fetch`, `window.turnstile`, speech recognition, time). Don't mock our own modules: drive the real `createTomClient` with a fake `fetch`.
- Expected values come from an independent source, such as a literal, a fixture or the API contract, never from recomputing the code's logic.
- Test names state behaviour in glossary terms ("withdraws a refused Visitor turn"), not mechanics ("calls setTurns").
