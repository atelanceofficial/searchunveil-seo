/**
 * Files a person chooses, read in parts and on demand.
 *
 * A file can be far larger than the memory a browser tab can spare, so the engine never
 * needs one whole: an archive is read from its directory, only the entries an analysis
 * uses are decompressed, and text is decoded and parsed as it streams in. Size alone is
 * therefore never a reason to turn a file away.
 */

/** A file, either already in memory or as a `Blob` (a browser `File` is one). */
export type InputFile =
  | { readonly name: string; readonly bytes: Uint8Array }
  | { readonly name: string; readonly blob: Blob };

/** Random access to a file's bytes. */
export interface ByteSource {
  readonly size: number;
  /** The bytes from `start` up to, but not including, `end`. */
  read(start: number, end: number): Promise<Uint8Array>;
  /** The same range as a stream, for ranges too large to hold at once. */
  stream(start: number, end: number): ReadableStream<Uint8Array<ArrayBuffer>>;
}

/** How much of a stream is read at a time when it is cut from bytes already in memory. */
const CHUNK_BYTES = 1024 * 1024;

export function sourceOf(file: InputFile): ByteSource {
  return 'blob' in file ? blobSource(file.blob) : bytesSource(file.bytes);
}

export function blobSource(blob: Blob): ByteSource {
  return {
    size: blob.size,
    async read(start, end) {
      const [from, to] = clamp(start, end, blob.size);
      return new Uint8Array(await blob.slice(from, to).arrayBuffer());
    },
    stream(start, end) {
      const [from, to] = clamp(start, end, blob.size);
      return blob.slice(from, to).stream();
    },
  };
}

export function bytesSource(bytes: Uint8Array): ByteSource {
  return {
    size: bytes.length,
    read(start, end) {
      const [from, to] = clamp(start, end, bytes.length);
      return Promise.resolve(bytes.subarray(from, to));
    },
    stream(start, end) {
      const [from, to] = clamp(start, end, bytes.length);
      let offset = from;
      return new ReadableStream<Uint8Array<ArrayBuffer>>({
        pull(controller) {
          if (offset >= to) {
            controller.close();
            return;
          }
          const next = Math.min(to, offset + CHUNK_BYTES);
          // A copy, so that consumers which transfer or detach chunks leave the input intact.
          controller.enqueue(bytes.slice(offset, next));
          offset = next;
        },
      });
    },
  };
}

/** Every chunk of a stream, in order. */
export async function* chunksOf(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    // Stops the underlying read when a consumer leaves early, for example at a row limit.
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function clamp(start: number, end: number, size: number): [number, number] {
  const from = Math.min(Math.max(0, start), size);
  return [from, Math.min(Math.max(from, end), size)];
}

/** True for the files a browser shows as web pages. */
export function isWebPage(name: string): boolean {
  return /\.(?:html?|xhtml)$/i.test(name);
}
