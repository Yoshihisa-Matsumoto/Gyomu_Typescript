import { describe, it, expect } from 'vitest';
import {
  bufferToArrayBuffer,
  arrayBufferToString,
  stringToArrayBuffer,
} from '../convert.js';

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
