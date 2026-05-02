import { describe, it, expect } from 'vitest';
import {
  LocalDate2Date,
  Date2LocalDate,
  createDateOnly,
  extractDateOnly,
  formatDateToYmd,
  parseYmdToDate,
  LocalDate,
} from '../entity/date.js';

// ---- LocalDate2Date ----
describe('LocalDate2Date', () => {
  it('正常系: YYYY-MM-DD -> Date変換', () => {
    const result = LocalDate2Date('2024-05-10' as LocalDate);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(4); // 0-based
    expect(result.getDate()).toBe(10);
  });

  it('境界: 月が1のとき正しく0になる', () => {
    const result = LocalDate2Date('2024-01-01' as LocalDate);

    expect(result.getMonth()).toBe(0);
  });
});

// ---- Date2LocalDate ----
describe('Date2LocalDate', () => {
  it('正常系: Date -> YYYY-MM-DD', () => {
    const date = new Date(2024, 4, 10); // May
    const result = Date2LocalDate(date);

    expect(result).toBe('2024-05-10');
  });
});

// ---- createDateOnly ----
describe('createDateOnly', () => {
  it('正常系: 日付を生成できる', () => {
    const result = createDateOnly(2024, 5, 10);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(10);
  });

  it('ゼロパディングされる', () => {
    const result = createDateOnly(2024, 1, 2);

    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(2);
  });
});

// ---- extractDateOnly ----
describe('extractDateOnly', () => {
  it('正常系: 時刻が削除される', () => {
    const date = new Date(2024, 4, 10, 15, 30, 45);

    const result = extractDateOnly(date);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('日付部分は維持される', () => {
    const date = new Date(2024, 4, 10, 23, 59);

    const result = extractDateOnly(date);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(10);
  });
});

// ---- formatDateToYmd ----
describe('formatDateToYmd', () => {
  it('正常系: YYYY-MM-DD形式になる', () => {
    const date = new Date(2024, 4, 10);

    const result = formatDateToYmd(date);

    expect(result).toBe('2024-05-10');
  });
});

// ---- parseYmdToDate ----
describe('parseYmdToDate', () => {
  it('正常系: YYYY-MM-DDをDateに変換', () => {
    const result = parseYmdToDate('2024-05-10');

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(10);
  });

  it('異常系: 不正フォーマットはエラー', () => {
    expect(() => parseYmdToDate('2024/05/10')).toThrow();
  });

  it('異常系: 存在しない日付はエラー', () => {
    expect(() => parseYmdToDate('2024-02-30')).toThrow();
  });

  it('厳密チェック: フォーマットが一致しない場合エラー', () => {
    expect(() => parseYmdToDate('2024-5-1')).toThrow();
  });
});
