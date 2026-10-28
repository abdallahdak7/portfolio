# abdallahdaknache.com

Personal portfolio. Vite + React + TypeScript + Tailwind, deployed to GitHub Pages on push to `main`.

- Content lives in `src/content.ts`. Edit there to update experience, approach, AI, the spotlight, Ask Tom, and skills.
- `npm run dev` to develop, `npm run build` to type-check and build.
- `npm test` runs the unit tests (Vitest).

## Ask Tom

The "Ask Tom" section chats with Tom, whose backend lives in [`abdallahdak7/speak-about-abdallah`](https://github.com/abdallahdak7/speak-about-abdallah) (API contract: `docs/api.md`). The Worker and the Turnstile widget only accept `https://abdallahdaknache.com`, so `npm run dev` uses a mock instead (`src/lib/tom/mock.ts`, which lists the keywords that trigger each error path). Check against the real backend only after deploying.

## Resume

Source: `resume/resume.html`. Regenerate the PDF by printing it to A4 (Chrome > Print > Save as PDF, margins: default) and saving it as `public/Abdallah_Daknache_Resume.pdf`.
