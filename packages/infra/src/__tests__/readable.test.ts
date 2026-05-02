import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import fs from 'fs';
import {
  readableStream2ArrayBuffer,
  readableStream2Buffer,
  fileInputToReadable,
  readableToBuffer,
} from '../stream/io/readable.js';

// --- readableStream2ArrayBuffer ---
describe('readableStream2ArrayBuffer', () => {
  it('should convert ReadableStream to ArrayBuffer', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('hello'));
        controller.close();
      },
    });

    const result = await readableStream2ArrayBuffer(stream);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });
});

// --- readableStream2Buffer ---
describe('readableStream2Buffer', () => {
  it('should convert ReadableStream to Buffer', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('hello'));
        controller.close();
      },
    });

    const result = await readableStream2Buffer(stream);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('hello');
  });
});

// --- toReadable ---
describe('toReadable', () => {
  it('should return Readable when Buffer is given', async () => {
    const buf = Buffer.from('hello');
    const stream = fileInputToReadable(buf);

    const result = await readableToBuffer(stream);
    expect(result.toString()).toBe('hello');
  });

  it('should return same Readable if already Readable', () => {
    const stream = Readable.from('hello');
    const result = fileInputToReadable(stream);

    expect(result).toBe(stream);
  });

  it('should create Readable from file path (mocked)', () => {
    const path = 'tests/rsa4096';
    const stream = fileInputToReadable(path, fs.createReadStream);

    // 中身まではテストしない（I/Oは別）
    expect(stream).toBeDefined();
  });
});

// --- toBuffer ---
describe('toBuffer', () => {
  it('should return same buffer if Buffer is given', async () => {
    const buf = Buffer.from('hello');
    const result = await readableToBuffer(buf);

    expect(result).toBe(buf);
  });

  it('should convert Readable to Buffer', async () => {
    const stream = Readable.from(['he', 'llo']);
    const result = await readableToBuffer(stream);

    expect(result.toString()).toBe('hello');
  });

  it('should handle binary chunks', async () => {
    const stream = Readable.from([Buffer.from([0x01]), Buffer.from([0x02])]);

    const result = await readableToBuffer(stream);
    expect(result.equals(Buffer.from([0x01, 0x02]))).toBe(true);
  });
});
