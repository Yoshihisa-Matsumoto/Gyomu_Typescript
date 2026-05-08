import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Transform } from 'node:stream';
import { Stream, Effect } from 'effect';
import {
  acquireNodeStream,
  fromReadable,
  fromReadableControlled,
  throughNodeStream,
  throughNodeStreamScoped,
} from '../bridge/nodeStream.js';
import { Readable } from 'node:stream';
import { IOError } from '@gyomu/core';
const createReadable = (chunks: string[]) => {
  return Readable.from(chunks.map((c) => Buffer.from(c)));
};
const createControlledReadable = (chunks: string[]) => {
  let index = 0;

  return new Readable({
    read() {
      if (index < chunks.length) {
        this.push(Buffer.from(chunks[index++]!));
      } else {
        this.push(null); // end
      }
    },
  });
};
const collectStream = async <T>(stream: Stream.Stream<T, IOError>) =>
  await Effect.runPromise(Stream.runCollect(stream));
describe('nodeStream', () => {
  describe('acquireNodeStream', () => {
    it('should acquire and release a node stream', async () => {
      const destroySpy = vi.fn();
      const mockStream = {
        destroy: destroySpy,
      } as unknown as Transform;

      const create = vi.fn(() => mockStream);
      const effect = acquireNodeStream(create);

      const result = await Effect.runPromise(Effect.scoped(effect));
      expect(create).toHaveBeenCalled();
      expect(result).toBe(mockStream);

      await Effect.runPromise(
        Effect.sync(() => {
          /* released */
        }),
      );
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const error = new Error('creation failed');
      const create = vi.fn(() => {
        throw error;
      });

      const effect = acquireNodeStream(create);
      await expect(Effect.runPromise(Effect.scoped(effect))).rejects.toThrow(
        'creation failed',
      );
    });
  });

  describe('throughNodeStream', () => {
    let transform: Transform;

    beforeEach(() => {
      transform = new Transform({
        objectMode: true,
        transform(chunk, _encoding, callback) {
          callback(null, Buffer.from(chunk.toString().toUpperCase()));
        },
      });
    });

    afterEach(() => {
      transform.destroy();
    });

    it('should transform stream data', async () => {
      const input = Stream.fromIterable(['hello', 'world']);
      const output = throughNodeStream<string, string>(transform)(input);

      const results: string[] = [];
      await Effect.runPromise(
        Stream.runForEach(output, (chunk) =>
          Effect.sync(() => {
            results.push(Buffer.isBuffer(chunk) ? chunk.toString() : chunk);
          }),
        ),
      );
      expect(results).toContain('HELLO');
      expect(results).toContain('WORLD');
    });

    it('should handle slow transform without data loss', async () => {
      const slowTransform = new Transform({
        highWaterMark: 1,
        objectMode: true,
        transform(chunk, _encoding, callback) {
          setTimeout(() => callback(null, chunk), 10);
        },
      });

      const input = Stream.fromIterable([1, 2, 3, 4, 5]);
      const output = throughNodeStream<number, number>(slowTransform)(input);

      const results: number[] = [];
      await Effect.runPromise(
        Stream.runForEach(output, (chunk) =>
          Effect.sync(() => {
            results.push(chunk as number);
          }),
        ),
      );

      expect(results).toHaveLength(5);
      slowTransform.destroy();
    });
    it('should apply backpressure via Queue (slow consumer)', async () => {
      const fastTransform = new Transform({
        objectMode: true,
        transform(chunk, _enc, cb) {
          cb(null, chunk); // 即流す（重要）
        },
      });

      const input = Stream.fromIterable(
        Array.from({ length: 200 }, (_, i) => i),
      );

      const output = throughNodeStream<number, number>(fastTransform)(input);

      const results: number[] = [];

      await Effect.runPromise(
        Stream.runForEach(output, (chunk) =>
          Effect.gen(function* () {
            // 👇 わざと遅くする（ここが本質）
            yield* Effect.sleep(10);

            results.push(chunk);
          }),
        ),
      );

      expect(results.length).toBe(200);
    });
    it('should handle transform errors', async () => {
      const errorTransform = new Transform({
        transform(_chunk, _encoding, callback) {
          callback(new Error('transform error'));
        },
      });

      const input = Stream.fromIterable(['test']);
      const output = throughNodeStream<string, string>(errorTransform)(input);

      await expect(
        Effect.runPromise(Stream.runForEach(output, () => Effect.void)),
      ).rejects.toThrow();

      errorTransform.destroy();
    });

    it('should handle empty input stream', async () => {
      const input = Stream.fromIterable<string>([]);
      const output = throughNodeStream<string, string>(transform)(input);

      const results: string[] = [];
      await Effect.runPromise(
        Stream.runForEach(output, (chunk) =>
          Effect.sync(() => {
            results.push(chunk as string);
          }),
        ),
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('throughNodeStreamScoped', () => {
    it('should acquire and use transform within scope', async () => {
      const create = vi.fn(
        () =>
          new Transform({
            transform(chunk, _encoding, callback) {
              callback(null, chunk);
            },
          }),
      );

      const input = Stream.fromIterable(['test']);
      const output = throughNodeStreamScoped<string, string>(create)(input);

      const results: string[] = [];
      await Effect.runPromise(
        Stream.runForEach(output, (chunk) =>
          Effect.sync(() => {
            results.push(Buffer.isBuffer(chunk) ? chunk.toString() : chunk);
          }),
        ),
      );

      expect(create).toHaveBeenCalled();
      expect(results).toContain('test');
    });

    it('should handle creation errors in scoped version', async () => {
      const error = new Error('creation failed');
      const create = vi.fn(() => {
        throw error;
      });

      const input = Stream.fromIterable(['test']);
      const output = throughNodeStreamScoped<string, string>(create)(input);

      await expect(
        Effect.runPromise(Stream.runForEach(output, () => Effect.void)),
      ).rejects.toThrow('creation failed');
    });

    it('should manage resource lifecycle automatically', async () => {
      const destroySpy = vi.fn();
      const create = vi.fn(() => {
        const t = new Transform({
          transform(chunk, _encoding, callback) {
            callback(null, chunk);
          },
        });
        const originalDestroy = t.destroy.bind(t);
        t.destroy = function (...args) {
          destroySpy();
          return originalDestroy(...args) as Transform;
        };
        return t;
      });

      const input = Stream.fromIterable(['test']);
      const output = throughNodeStreamScoped<string, string>(create)(input);

      await Effect.runPromise(Stream.runForEach(output, () => Effect.void));

      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
describe('fromReadable', () => {
  it('ReadableをStreamに変換できる', async () => {
    const readable = createReadable(['a', 'b', 'c']);

    const stream = fromReadable(readable);

    const result = await collectStream(stream);

    expect(result.map((b) => b.toString())).toEqual(['a', 'b', 'c']);
  });
});

describe('fromReadableControlled', () => {
  it('データを読み取って終了する', async () => {
    const readable = createControlledReadable(['hello', 'world']);

    const stream = fromReadableControlled(readable);

    const result = await collectStream(stream);

    expect(Buffer.concat(result).toString()).toBe('helloworld');
  });
  it('errorイベントでfailする', async () => {
    const readable = new Readable({
      read() {},
    });

    const stream = fromReadableControlled(readable);

    const promise = Effect.runPromise(Stream.runCollect(stream));
    // await Promise.resolve();
    // setTimeout(() => {
    //   readable.emit('error', new Error('test error'));
    // }, 0);
    setImmediate(() => {
      readable.emit('error', new Error('test error'));
    });

    await expect(promise).rejects.toBeDefined();
  });
  it('空でも正常終了する', async () => {
    const readable = createControlledReadable([]);

    const stream = fromReadableControlled(readable);

    const result = await collectStream(stream);

    expect(result.length).toBe(0);
  });
});
