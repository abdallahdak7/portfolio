import { describe, expect, it } from "vitest";
import { readEvents, type RawEvent } from "./sse";

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const events: RawEvent[] = [];
  for await (const event of readEvents(stream)) events.push(event);
  return events;
}

describe("readEvents", () => {
  it("yields named events with their data", async () => {
    const events = await collect(
      streamOf('event: text_delta\ndata: {"text":"Hi"}\n\nevent: done\ndata: {}\n\n'),
    );
    expect(events).toEqual([
      { event: "text_delta", data: '{"text":"Hi"}' },
      { event: "done", data: "{}" },
    ]);
  });

  it("reassembles events split across chunks, including inside a multi-byte character", async () => {
    const bytes = new TextEncoder().encode('event: text_delta\ndata: {"text":"café"}\n\n');
    const split = bytes.length - 6; // inside "é"
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 7));
        controller.enqueue(bytes.slice(7, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    });
    expect(await collect(stream)).toEqual([{ event: "text_delta", data: '{"text":"café"}' }]);
  });

  it("accepts CRLF line endings, comments and multi-line data", async () => {
    const events = await collect(streamOf(": ping\r\n\r\nevent: x\r\ndata: a\r\ndata: b\r\n\r\n"));
    expect(events).toEqual([{ event: "x", data: "a\nb" }]);
  });

  it("defaults the event name to message and drops a trailing incomplete event", async () => {
    const events = await collect(streamOf("data: 1\n\nevent: done\ndata: {}"));
    expect(events).toEqual([{ event: "message", data: "1" }]);
  });
});
