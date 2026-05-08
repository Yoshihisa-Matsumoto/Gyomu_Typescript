import { Effect, Stream } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockFetch } from './fetchMock.js';
import { fetchJson } from '../api.js';
import { fetchStream } from '../client.js';
import { jsonEffect } from '../json.js';
import { textEffect } from '../xml.js';

global.fetch = vi.fn();

describe('fetchJson', () => {
  it('should fetch and parse json', async () => {
    mockFetch({ a: 1 });

    const result = await Effect.runPromise(
      fetchJson('http://test', 'GET', null),
    );

    expect(result.value).toEqual({ a: 1 });
    expect(result.code).toBe(200);
  });

  it('should fail on invalid json', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('invalid json'));
          controller.close();
        },
      }),
    });

    await expect(
      Effect.runPromise(fetchJson('http://test', 'GET', null)),
    ).rejects.toThrow();
  });

  it('should validate response', async () => {
    mockFetch({ a: 1 });

    await expect(
      Effect.runPromise(
        fetchJson<null, { a: number }>('http://test', 'GET', null, {
          isValidData: (x) => x.a === 2,
        }),
      ),
    ).rejects.toThrow();
  });
});

describe('fetchStream', () => {
  it('should stream data', async () => {
    mockFetch({ a: 1 });

    const stream = fetchStream('http://test');

    const chunks = await Effect.runPromise(stream.pipe(Stream.runCollect));

    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should fail on http error', async () => {
    mockFetch({}, { ok: false, status: 500 });

    await expect(
      Effect.runPromise(fetchStream('http://test').pipe(Stream.runCollect)),
    ).rejects.toThrow();
  });
});

const createStream = (text: string) =>
  Stream.fromIterable([new TextEncoder().encode(text)]);

describe('jsonEffect', () => {
  it('should parse json', async () => {
    const stream = createStream(JSON.stringify({ a: 1 }));

    const result = await Effect.runPromise(jsonEffect(stream));

    expect(result).toEqual({ a: 1 });
  });

  it('should fail invalid json', async () => {
    const stream = createStream('invalid');

    await expect(Effect.runPromise(jsonEffect(stream))).rejects.toThrow();
  });
});

describe('textEffect', () => {
  it('should convert to string', async () => {
    const stream = createStream('hello');

    const result = await Effect.runPromise(textEffect(stream));

    expect(result).toBe('hello');
  });
});
