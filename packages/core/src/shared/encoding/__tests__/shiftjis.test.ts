import { describe, it, expect } from 'vitest';
import { encodeUtf8ToShiftJisBuffer } from '../shiftjis.js';

// --- utf8String2ShiftJisBuffer ---
describe('utf8String2ShiftJisBuffer', () => {
  it('should convert ASCII string', () => {
    const result = encodeUtf8ToShiftJisBuffer('hello');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should convert Japanese string', () => {
    const result = encodeUtf8ToShiftJisBuffer('こんにちは');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
