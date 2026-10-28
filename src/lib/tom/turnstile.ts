// Cloudflare Turnstile, rendered explicitly so each request gets its own fresh token.
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/

type RenderOptions = {
  sitekey: string;
  execution: "render" | "execute";
  appearance: "always" | "execute" | "interaction-only";
  callback: (token: string) => void;
  "error-callback": () => boolean | void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "before-interactive-callback": () => void;
  "after-interactive-callback": () => void;
};

type TurnstileApi = {
  render(container: HTMLElement, options: RenderOptions): string;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 120_000;

let script: Promise<TurnstileApi> | null = null;

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  script ??= new Promise<TurnstileApi>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_URL;
    el.async = true;
    el.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    el.onerror = () => {
      script = null;
      el.remove();
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(el);
  });
  return script;
}

export type Turnstile = {
  /** The element the widget renders into. It stays invisible unless the Visitor has to interact. */
  attach(container: HTMLElement | null): void;
  /** Starts loading the script ahead of the first request. */
  preload(): void;
  getToken(): Promise<string>;
  /** Tells the listener when the challenge starts and stops waiting on the Visitor. Returns an unsubscribe. */
  onInteractive(listener: (needed: boolean) => void): () => void;
};

export function createTurnstile(sitekey: string): Turnstile {
  let container: HTMLElement | null = null;
  let widgetId: string | null = null;
  let pending: { resolve: (token: string) => void; reject: (e: Error) => void; timer: number } | null = null;
  const listeners = new Set<(needed: boolean) => void>();
  const setInteractive = (needed: boolean) => listeners.forEach((l) => l(needed));

  const settle = (outcome: { token: string } | { error: string }) => {
    const p = pending;
    pending = null;
    if (!p) return;
    setInteractive(false);
    clearTimeout(p.timer);
    if ("token" in outcome) p.resolve(outcome.token);
    else p.reject(new Error(outcome.error));
  };

  return {
    attach(el) {
      if (el === container) return;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      widgetId = null;
      container = el;
    },

    preload() {
      loadScript().catch(() => {});
    },

    async getToken() {
      const api = await loadScript();
      if (!container) throw new Error("Turnstile has no container");
      settle({ error: "superseded" });

      const token = new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (pending?.timer === timer) settle({ error: "timed out" });
        }, TOKEN_TIMEOUT_MS) as unknown as number;
        pending = { resolve, reject, timer };
      });

      if (!widgetId) {
        widgetId = api.render(container, {
          sitekey,
          execution: "execute",
          appearance: "interaction-only",
          callback: (t) => settle({ token: t }),
          "error-callback": () => {
            settle({ error: "challenge failed" });
            return true;
          },
          "expired-callback": () => {},
          "timeout-callback": () => settle({ error: "challenge timed out" }),
          "before-interactive-callback": () => setInteractive(true),
          "after-interactive-callback": () => setInteractive(false),
        });
      } else {
        // Tokens are single-use: clear the last one before solving again.
        api.reset(widgetId);
      }
      api.execute(widgetId);
      return token;
    },

    onInteractive(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
