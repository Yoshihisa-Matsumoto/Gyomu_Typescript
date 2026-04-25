import { describe, it, expect } from 'vitest';
import { convertToYmd } from '../holiday/jpxFetcher.js';

describe('convertToYmd', () => {
  it('正常系: 通常の日付', () => {
    const result = convertToYmd('2024', 'Jan. 5 (Mon.)');
    expect(result).toBe('2024-01-05');
  });

  it('正常系: 括弧なし', () => {
    const result = convertToYmd('2024', 'Feb. 10');
    expect(result).toBe('2024-02-10');
  });

  it('正常系: 1桁日付 → 2桁になる', () => {
    const result = convertToYmd('2024', 'Mar. 3 (Wed.)');
    expect(result).toBe('2024-03-03');
  });

  it('正常系: 前後スペースあり', () => {
    const result = convertToYmd('2024', '  Apr. 1 (Tue.)  ');
    expect(result).toBe('2024-04-01');
  });

  it('異常系: 不正な日付フォーマット', () => {
    expect(() => convertToYmd('2024', 'Invalid Date')).toThrowError(
      /Invalid date/,
    );
  });

  it('異常系: 存在しない日付', () => {
    expect(() => convertToYmd('2024', 'Feb. 30')).toThrowError(/Invalid date/);
  });

  it('境界: 月末', () => {
    const result = convertToYmd('2024', 'Dec. 31 (Tue.)');
    expect(result).toBe('2024-12-31');
  });

  it('整合性: yearが正しく付与される', () => {
    const result = convertToYmd('2025', 'Jan. 1 (Wed.)');
    expect(result.startsWith('2025')).toBe(true);
  });
});
