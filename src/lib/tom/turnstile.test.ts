import { afterEach, describe, expect, it, vi } from "vitest";
import { createTurnstile } from "./turnstile";

/** A fake `window.turnstile` that solves each execute with the next token when told to. */
function fakeTurnstileApi() {
  type Options = { callback: (t: string) => void; "before-interactive-callback": () => void };
  let options: Options | null = null;
  const api = {
    render: vi.fn((_el: unknown, o: Options) => {
      options = o;
      return "widget-1";
    }),
    execute: vi.fn(),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  return {
    api,
    solve: (token: string) => options?.callback(token),
    askVisitor: () => options?.["before-interactive-callback"](),
  };
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

  it("reports when the challenge waits on the Visitor, until it's solved", async () => {
    const { api, solve, askVisitor } = fakeTurnstileApi();
    vi.stubGlobal("window", { turnstile: api });
    const turnstile = createTurnstile("site-key");
    turnstile.attach({} as HTMLElement);
    const seen: boolean[] = [];
    turnstile.onInteractive((needed) => seen.push(needed));

    const token = turnstile.getToken();
    await vi.waitFor(() => expect(api.execute).toHaveBeenCalledTimes(1));
    askVisitor();
    solve("t1");
    await token;
    expect(seen).toEqual([true, false]);
  });
});
