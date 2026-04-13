import { describe, it, expect } from 'vitest';
import {
  createDateOnly,
  extractDateOnly,
  formatDateToYmd,
  parseYmdToDate,
} from '../dateOperation.js';
import { ValueError } from '../errors.js';

// --- createDateOnly ---
describe('createDateOnly', () => {
  it('should create correct date', () => {
    const date = createDateOnly(2024, 5, 2);

    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(4); // 0-based
    expect(date.getDate()).toBe(2);
  });

  it('should zero-pad month and day', () => {
    const date = createDateOnly(2024, 1, 2);

    expect(formatDateToYmd(date)).toBe('2024-01-02');
  });
});

// --- extractDateOnly ---
describe('extractDateOnly', () => {
  it('should remove time component', () => {
    const original = new Date('2024-05-02T15:30:45');
    const result = extractDateOnly(original);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('should preserve date', () => {
    const original = new Date('2024-05-02T23:59:59');
    const result = extractDateOnly(original);

    expect(formatDateToYmd(result)).toBe('2024-05-02');
  });
});

// --- formatDateToYmd ---
describe('formatDateToYmd', () => {
  it('should format date to yyyy-MM-dd', () => {
    const date = new Date(2024, 4, 2); // May
    const result = formatDateToYmd(date);

    expect(result).toBe('2024-05-02');
  });
});

// --- parseYmdToDate ---
describe('parseYmdToDate', () => {
  it('should parse valid date string', () => {
    const result = parseYmdToDate('2024-05-02');

    expect(result).toBeInstanceOf(Date);
    expect(formatDateToYmd(result)).toBe('2024-05-02');
  });

  it('should throw on invalid format', () => {
    expect(() => parseYmdToDate('2024/05/02')).toThrow(ValueError);
  });

  it('should throw on invalid date (e.g. Feb 30)', () => {
    expect(() => parseYmdToDate('2024-02-30')).toThrow(ValueError);
  });

  it('should reject partially valid date (important!)', () => {
    // date-fnsは補正するのでそれを弾くテスト
    expect(() => parseYmdToDate('2024-02-31')).toThrow(ValueError);
  });

  it('should reject non-zero-padded input', () => {
    expect(() => parseYmdToDate('2024-5-2')).toThrow(ValueError);
  });
});
