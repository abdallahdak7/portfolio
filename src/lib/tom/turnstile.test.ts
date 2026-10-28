import { afterEach, describe, expect, it, vi } from "vitest";
import { createTurnstile } from "./turnstile";

/** A fake `window.turnstile` that solves each execute with the next token when told to. */
function fakeTurnstileApi() {
  let callback: (token: string) => void = () => {};
  const api = {
    render: vi.fn((_el: unknown, options: { callback: (t: string) => void }) => {
      callback = options.callback;
      return "widget-1";
    }),
    execute: vi.fn(),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  return { api, solve: (token: string) => callback(token) };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("createTurnstile", () => {
  it("resets the widget before solving each new token", async () => {
    const { api, solve } = fakeTurnstileApi();
    vi.stubGlobal("window", { turnstile: api });
    const turnstile = createTurnstile("site-key");
    turnstile.attach({} as HTMLElement);

    const first = turnstile.getToken();
    await vi.waitFor(() => expect(api.execute).toHaveBeenCalledTimes(1));
    solve("t1");
    expect(await first).toBe("t1");

    const second = turnstile.getToken();
    await vi.waitFor(() => expect(api.execute).toHaveBeenCalledTimes(2));
    solve("t2");
    expect(await second).toBe("t2");
    expect(api.render).toHaveBeenCalledTimes(1);
    expect(api.reset).toHaveBeenCalledTimes(1);
  });

  it("doesn't let an earlier request's timeout fail a later one", async () => {
    vi.useFakeTimers();
    const { api, solve } = fakeTurnstileApi();
    vi.stubGlobal("window", { turnstile: api });
    const turnstile = createTurnstile("site-key");
    turnstile.attach({} as HTMLElement);

    const first = turnstile.getToken();
    await vi.waitFor(() => expect(api.execute).toHaveBeenCalledTimes(1));
    solve("t1");
    await first;

    await vi.advanceTimersByTimeAsync(100_000);
    const second = turnstile.getToken();
    await vi.waitFor(() => expect(api.execute).toHaveBeenCalledTimes(2));
    await vi.advanceTimersByTimeAsync(30_000); // past the first request's 120s mark
    solve("t2");
    expect(await second).toBe("t2");
  });

  it("fails a token request that's never solved", async () => {
    vi.useFakeTimers();
    const { api } = fakeTurnstileApi();
    vi.stubGlobal("window", { turnstile: api });
    const turnstile = createTurnstile("site-key");
    turnstile.attach({} as HTMLElement);

    const token = turnstile.getToken();
    const outcome = expect(token).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(120_000);
    await outcome;
  });
});
