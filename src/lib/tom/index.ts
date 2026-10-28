import { about } from "@/content";
import { browserSpeechRecognition } from "@/lib/speech";
import { createAskTom } from "./askTom";
import { createTomClient } from "./client";
import { mockFetch, mockTurnstileToken } from "./mock";
import { createTurnstile, type Turnstile } from "./turnstile";

export * from "./askTom";
export * from "./client";

const BASE_URL = "https://speak-about-abdallah.abdallah-daknache.workers.dev";
// Site keys are public. The secret lives only on the Worker.
const TURNSTILE_SITE_KEY = "0x4AAAAAAFpvj-Xu069Vu_di";

// The Worker and the Turnstile widget only accept https://abdallahdaknache.com, so dev runs against
// a mock (see ./mock.ts). `import.meta.env.DEV` is false in builds, which drops the mock from the bundle.
export const turnstile: Turnstile = import.meta.env.DEV
  ? { attach() {}, preload() {}, getToken: mockTurnstileToken, onInteractive: () => () => {} }
  : createTurnstile(TURNSTILE_SITE_KEY);

const tom = import.meta.env.DEV
  ? createTomClient({ baseUrl: BASE_URL, fetch: mockFetch, getTurnstileToken: turnstile.getToken })
  : createTomClient({ baseUrl: BASE_URL, getTurnstileToken: turnstile.getToken });

export const askTom = createAskTom({
  tom,
  humanCheck: turnstile,
  fallbackEmail: about.email,
  speechRecognition: browserSpeechRecognition(),
});
