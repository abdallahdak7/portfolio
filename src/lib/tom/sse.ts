export type RawEvent = { event: string; data: string };

/**
 * Reads a `text/event-stream` body into events. An event that the stream cuts off
 * before its closing blank line is dropped, so a truncated stream yields no `done`.
 */
export async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<RawEvent> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let event = "";
  let data: string[] = [];

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += value;

      let newline: number;
      while ((newline = buffer.search(/\r\n|\r|\n/)) !== -1) {
        const line = buffer.slice(0, newline);
        const width = buffer.startsWith("\r\n", newline) ? 2 : 1;
        // A lone "\r" at the end of a chunk may be the first half of "\r\n".
        if (width === 1 && buffer[newline] === "\r" && newline === buffer.length - 1) break;
        buffer = buffer.slice(newline + width);

        if (line === "") {
          if (data.length > 0) yield { event: event || "message", data: data.join("\n") };
          event = "";
          data = [];
          continue;
        }
        if (line.startsWith(":")) continue;

        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? "" : line.slice(colon + 1);
        if (value.startsWith(" ")) value = value.slice(1);

        if (field === "event") event = value;
        else if (field === "data") data.push(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
