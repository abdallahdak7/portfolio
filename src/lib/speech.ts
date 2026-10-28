// The browser's speech recognition, as far as Dictation uses it. TypeScript's DOM types don't include it yet.
// https://developer.mozilla.org/docs/Web/API/SpeechRecognition

export type SpeechRecognitionResults = ArrayLike<ArrayLike<{ transcript: string }>>;

export type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  /** `results` holds every phrase heard since `start`, the last one possibly still being revised. */
  onresult: ((event: { results: SpeechRecognitionResults }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  /** Fires once recognition stops, for whatever reason, including after `onerror`. */
  onend: (() => void) | null;
  start(): void;
  /** Stops listening and still delivers what was heard. */
  stop(): void;
  /** Stops listening and drops what hasn't been delivered. */
  abort(): void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/** The browser's speech recognition, or undefined where there is none (Firefox, for one). */
export function browserSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}
