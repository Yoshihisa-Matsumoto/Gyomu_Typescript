import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import {
  utf8String2ShiftJisBuffer,
  readableStream2ArrayBuffer,
  readableStream2Buffer,
  toReadable,
  toBuffer,
  bufferToArrayBuffer,
  arrayBufferToString,
  stringToArrayBuffer,
} from '../buffer.js'; // パス調整

// --- stringToArrayBuffer ---
describe('stringToArrayBuffer', () => {
  it('should convert ASCII string to ArrayBuffer', () => {
    const result = stringToArrayBuffer('hello');

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(5);
  });

  it('should convert UTF-8 string correctly', () => {
    const result = stringToArrayBuffer('こんにちは');

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(5); // マルチバイト
  });

  it('should handle empty string', () => {
    const result = stringToArrayBuffer('');

    expect(result.byteLength).toBe(0);
  });
});

// --- arrayBufferToString ---
describe('arrayBufferToString', () => {
  it('should convert ArrayBuffer to string', () => {
    const buf = stringToArrayBuffer('hello');
    const result = arrayBufferToString(buf);

    expect(result).toBe('hello');
  });

  it('should correctly decode UTF-8 string', () => {
    const original = 'こんにちは';
    const buf = stringToArrayBuffer(original);

    const result = arrayBufferToString(buf);
    expect(result).toBe(original);
  });

  it('should handle empty buffer', () => {
    const buf = new ArrayBuffer(0);
    const result = arrayBufferToString(buf);

    expect(result).toBe('');
  });
});

// --- bufferToArrayBuffer ---
describe('bufferToArrayBuffer', () => {
  it('should convert Buffer to ArrayBuffer', () => {
    const buffer = Buffer.from('hello');
    const result = bufferToArrayBuffer(buffer);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(5);
  });

  it('should preserve binary data', () => {
    const buffer = Buffer.from([0x01, 0x02, 0x03]);
    const result = bufferToArrayBuffer(buffer);

    const view = new Uint8Array(result);
    expect([...view]).toEqual([0x01, 0x02, 0x03]);
  });

  it('should handle sliced buffer correctly (important!)', () => {
    const original = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    const sliced = original.subarray(1, 3); // [0x01, 0x02]

    const result = bufferToArrayBuffer(sliced);
    const view = new Uint8Array(result);

    expect([...view]).toEqual([0x01, 0x02]);
  });
});
// --- utf8String2ShiftJisBuffer ---
describe('utf8String2ShiftJisBuffer', () => {
  it('should convert ASCII string', () => {
    const result = utf8String2ShiftJisBuffer('hello');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should convert Japanese string', () => {
    const result = utf8String2ShiftJisBuffer('こんにちは');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

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
    const stream = toReadable(buf);

    const result = await toBuffer(stream);
    expect(result.toString()).toBe('hello');
  });

  it('should return same Readable if already Readable', () => {
    const stream = Readable.from('hello');
    const result = toReadable(stream);

    expect(result).toBe(stream);
  });

  it('should create Readable from file path (mocked)', () => {
    const path = 'dummy.txt';
    const stream = toReadable(path);

    // 中身まではテストしない（I/Oは別）
    expect(stream).toBeDefined();
  });
});

// --- toBuffer ---
describe('toBuffer', () => {
  it('should return same buffer if Buffer is given', async () => {
    const buf = Buffer.from('hello');
    const result = await toBuffer(buf);

    expect(result).toBe(buf);
  });

  it('should convert Readable to Buffer', async () => {
    const stream = Readable.from(['he', 'llo']);
    const result = await toBuffer(stream);

    expect(result.toString()).toBe('hello');
  });

  it('should handle binary chunks', async () => {
    const stream = Readable.from([Buffer.from([0x01]), Buffer.from([0x02])]);

    const result = await toBuffer(stream);
    expect(result.equals(Buffer.from([0x01, 0x02]))).toBe(true);
  });
});
