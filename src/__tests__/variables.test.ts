import { VariableTranslatorService } from '../variable.js';
import {
  parseYmdToDate,
  createDateOnly,
  formatDateToYmd,
} from '../dateOperation.js';
import { beforeEach, describe, expect, test } from 'vitest';
import { Effect, Layer } from 'effect';
import { MarketDateService } from '../holidays.js';
import { GyomuRepositoryMock } from './baseDBClass.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../effect/infrastructure/runtime.js';
import { MainLayer } from '../effect/infrastructure/layer.js';
import { ConfigLayer } from '../effect/infrastructure/config.js';

const TestLayer = Layer.mergeAll(
  VariableTranslatorService.live,
  MainLayer,
  ConfigLayer,
)
  .pipe(Layer.provideMerge(MarketDateService.live))
  .pipe(Layer.provideMerge(GyomuRepositoryMock))
  // .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const testRunner = makeRunner(TestLayer);

beforeEach(async () => {});

const testCases = [
  { parameter: '{%JP$TODAY$yyyy-MM-dd%}', expected: '1984-05-02' },
  { parameter: '{%JP$2$NEXTBUS$yyyy-MM-dd%}', expected: '1984-05-07' },
  { parameter: '{%JP$2$PREVBUS$yyyy-MM-dd%}', expected: '1984-04-27' },
  { parameter: '{%JP$2$BBOM$yyyy-MM-dd%}', expected: '1984-05-02' },
  { parameter: '{%JP$2$BBOY$yyyy-MM-dd%}', expected: '1984-01-04' },
  { parameter: '{%JP$2$BOM$yyyy-MM-dd%}', expected: '1984-05-02' },
  { parameter: '{%JP$2$BOY$yyyy-MM-dd%}', expected: '1984-01-02' },
  { parameter: '{%JP$2$BEOM$yyyy-MM-dd%}', expected: '1984-05-30' },
  { parameter: '{%JP$2$BEOY$yyyy-MM-dd%}', expected: '1984-12-28' },
  { parameter: '{%JP$2$EOM$yyyy-MM-dd%}', expected: '1984-05-30' },
  { parameter: '{%JP$2$EOY$yyyy-MM-dd%}', expected: '1984-12-30' },
  { parameter: '{%JP$2$NEXTBBOM$yyyy-MM-dd%}', expected: '1984-06-04' },
  { parameter: '{%JP$2$NEXTBUS$yyyy-MM-dd%}', expected: '1984-05-07' },
  { parameter: '{%JP$2$NEXTDAY$yyyy-MM-dd%}', expected: '1984-05-04' },
  { parameter: '{%JP$2$NEXTBEOM$yyyy-MM-dd%}', expected: '1984-06-28' },
  { parameter: '{%JP$2$PREVBUS$yyyy-MM-dd%}', expected: '1984-04-27' },
  { parameter: '{%JP$2$PREVDAY$yyyy-MM-dd%}', expected: '1984-04-30' },
  { parameter: '{%JP$2$PREVBEOM$yyyy-MM-dd%}', expected: '1984-04-26' },
];

describe('VariableTranslatorService', () => {
  describe('parse - 正常系', () => {
    test('variables parse', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        for (const c of testCases) {
          const result = yield* translator.parse(c.parameter, targetDate, 'JP');
          if (result !== c.expected) console.log(c.parameter);
          expect(result).toEqual(c.expected);
        }
      });
      await testRunner(program);
    });
  });

  describe('parse - 異常系', () => {
    test('invalid keyword', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%JP$UNKNOWN$yyyy-MM-dd%}';
        const expected = 'Start: 1984-05-02, Next: 1984-05-04';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await expect(testRunner(program)).rejects.toMatchObject({
        _tag: 'ValueError',
      });
    });
    test('repeated date keyword', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%JP$TODAY$NEXTDAY$yyyy-MM-dd%}';
        const expected = 'Start: 1984-05-02, Next: 1984-05-04';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await expect(testRunner(program)).rejects.toMatchObject({
        _tag: 'ValueError',
      });
    });
    test('no format', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%JP$TODAY%}';
        const expected = 'Start: 1984-05-02, Next: 1984-05-04';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await expect(testRunner(program)).rejects.toMatchObject({
        _tag: 'ValueError',
      });
    });
    test('invalid market', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%UK$TODAY$yyyy-MM-dd%}';
        const expected = 'Start: 1984-05-02, Next: 1984-05-04';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await expect(testRunner(program)).rejects.toMatchObject({
        _tag: 'ValueError',
      });
    });
  });

  describe('parse - 複合パターン', () => {
    test('should handle multiple expressions in one string', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input =
          'Start: {%JP$TODAY$yyyy-MM-dd%}, Next: {%JP$2$NEXTDAY$yyyy-MM-dd%}';
        const expected = 'Start: 1984-05-02, Next: 1984-05-04';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await testRunner(program);
    });
  });

  describe('parseDate', () => {
    test('variables parseDate', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = parseYmdToDate('1984-05-02');
        for (const c of testCases) {
          const result = yield* translator.parseDate(
            c.parameter,
            targetDate,
            'JP',
          );
          //const expectedDate = parseYmdToDate(c.expected); // JSTに変換
          //if (!isEqual(result, expectedDate)) console.log(c.parameter);
          expect(formatDateToYmd(result)).toEqual(c.expected);
        }
      });
      await testRunner(program);
    });
  });

  describe('state遷移', () => {
    test('should maintain state across multiple calls', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%JP$TODAY$yyyy$MM$dd%}';
        const expected = '19840502';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await testRunner(program);
    });
  });

  describe('Market切り替え', () => {
    test('multiple market', async () => {
      const program = Effect.gen(function* () {
        const translator = yield* VariableTranslatorService;
        const targetDate = createDateOnly(1984, 5, 2);
        const input = '{%JP$TODAY$yyyy-MM-dd%}_{%US$TODAY$yyyy-MM-dd%}';
        const expected = '1984-05-02_1984-05-02';
        const result = yield* translator.parse(input, targetDate, 'JP');
        expect(result).toEqual(expected);
      });
      await testRunner(program);
    });
  });
});
