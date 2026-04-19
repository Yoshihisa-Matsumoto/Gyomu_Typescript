import { describe, it, expect, beforeEach } from 'vitest';
import { Effect, Layer } from 'effect';
import { GyomuRepository } from '../GyomuRepository.js';
import { MainLayer } from '../../infrastructure/layer.js';
import { ConfigLayer } from '../../infrastructure/config.js';
import { KyselyService } from '../../infrastructure/db/KyselyService.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../../infrastructure/runtime.js';
import { MssqlService } from '../../infrastructure/db/MssqlService.js';
import { LocalDate, YearMonth } from '../../schemas/date.js';

const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer, GyomuRepository.live)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const testRunner = makeRunner(TestLayer);

const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';
describe('statusHandler Repository (Integration)', () => {
  beforeEach(async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const statusHandler = repo.statusHandler;

      const filtered = yield* statusHandler.findByApplicationId(testId);

      yield* statusHandler.deleteRecords(filtered.map((f) => f.id));

      console.log('Deleted before test');
    });
    await testRunner(program, TestLayer);
  });

  it('CRUD + find methods should work correctly', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const statusHandler = repo.statusHandler;

      // --- CREATE ---
      const created = yield* statusHandler.create([
        {
          applicationId: testId,
          statusTypeId: testId,
          recipientAddress: null,
          recipientType: null,
          region: null,
        },
      ]);

      expect(created.length).toBe(1);
      expect(created[0].applicationId).toBe(testId);

      const createdId = created[0].id;
      // --- FIND BY ID ---
      const found = yield* statusHandler.findById(createdId);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(createdId);

      // --- UPDATE ---
      const updated = yield* statusHandler.updateRecords([
        { id: createdId, region: 'JPN' },
      ]);

      expect(updated[0].region).toBe('JPN');

      // --- FIND ALL ---
      const all = yield* statusHandler.findAll();
      expect(all.length).toBeGreaterThan(0);

      // --- FIND BY COLUMN ---
      const filtered = yield* statusHandler.findByApplicationId(testId);
      expect(filtered.length).toBeGreaterThan(0);
      console.log(filtered[0].id);
      console.log(createdId);
      expect(filtered.every((r) => r.id == createdId)).toBe(true);

      // --- DELETE ---
      yield* statusHandler.deleteRecords([createdId]);

      const afterDelete = yield* statusHandler.findById(createdId);
      expect(afterDelete).toBeUndefined();
      console.log('AllDone');
      return true;
    });

    const result = await testRunner(program, TestLayer);

    expect(result).toBe(true);
  });
});

describe('milestoneDaily Repository (Integration)', () => {
  const milestoneId = 'TEST-MILESTONE';
  //const otherMilestoneId = 'OTHER-MILESTONE';

  const dailyDate = '2024-01-01' as LocalDate;
  const otherDailyDate = '2024-01-02' as LocalDate;

  const monthlyYm = '2024-01' as YearMonth;
  const otherMonthlyYm = '2024-02' as YearMonth;
  const testOwner = 'test-user';
  beforeEach(async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      let all = yield* m.findByTargetDate(dailyDate);
      if (all.length > 0) {
        yield* m.deleteRecords(all.map((r) => r.id));
      }
      all = yield* m.findByTargetDate(otherDailyDate);
      if (all.length > 0) {
        yield* m.deleteRecords(all.map((r) => r.id));
      }
    });

    await testRunner(program, TestLayer);
  });

  // -----------------------------
  // ① findByMilestoneIdAndTargetDate
  // -----------------------------

  it('should return only daily when isMonthly=false', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
        ],
        testOwner,
      );

      const result = yield* m.findByMilestoneIdAndTargetDate(
        milestoneId,
        dailyDate as LocalDate,
        false,
      );

      expect(result.length).toBe(1);
      expect(result[0].targetType).toBe('daily');
    });

    await testRunner(program, TestLayer);
  });

  it('should return only monthly when isMonthly=true', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetDate: LocalDate.make(otherDailyDate),
            targetYm: monthlyYm,
          },
        ],
        testOwner,
      );

      const result = yield* m.findByMilestoneIdAndTargetDate(
        milestoneId,
        dailyDate as LocalDate,
        true,
      );

      expect(result.length).toBe(1);
      expect(result[0].targetType).toBe('monthly');
    });

    await testRunner(program, TestLayer);
  });

  // -----------------------------
  // ② findByTargetDateAndMonthlyDate
  // -----------------------------

  it('should return only daily match', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetYm: otherMonthlyYm,
            targetDate: LocalDate.make(otherDailyDate),
          },
        ],
        testOwner,
      );

      const result = yield* m.findByTargetDateAndMonthlyDate(
        dailyDate as LocalDate,
        monthlyYm as YearMonth,
      );

      expect(result.length).toBe(1);
      expect(result[0].targetType).toBe('daily');
    });

    await testRunner(program, TestLayer);
  });

  it('should return only monthly match', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(otherDailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetYm: monthlyYm,
            targetDate: LocalDate.make(dailyDate),
          },
        ],
        testOwner,
      );

      const result = yield* m.findByTargetDateAndMonthlyDate(
        dailyDate,
        monthlyYm,
      );

      expect(result.length).toBe(1);
      expect(result[0].targetType).toBe('monthly');
    });

    await testRunner(program, TestLayer);
  });

  it('should return both daily and monthly', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetYm: monthlyYm,
            targetDate: LocalDate.make(otherDailyDate),
          },
        ],
        testOwner,
      );

      const result = yield* m.findByTargetDateAndMonthlyDate(
        dailyDate,
        monthlyYm,
      );

      expect(result.length).toBe(2);
    });

    await testRunner(program, TestLayer);
  });

  it('should return empty when no match', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      const result = yield* m.findByTargetDateAndMonthlyDate(
        dailyDate,
        monthlyYm,
      );

      expect(result.length).toBe(0);
    });

    await testRunner(program, TestLayer);
  });

  // -----------------------------
  // ③ deleteByMilestoneIdAndTargetDate
  // -----------------------------

  it('should delete only daily', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetYm: monthlyYm,
            targetDate: LocalDate.make(otherDailyDate),
          },
        ],
        testOwner,
      );

      yield* m.deleteByMilestoneIdAndTargetDate(milestoneId, dailyDate, false);

      const remain = yield* m.findByMilestoneIdAndTargetDate(
        milestoneId,
        dailyDate,
        true,
      );

      expect(remain.length).toBe(1);
      expect(remain[0].targetType).toBe('monthly');
    });

    await testRunner(program, TestLayer);
  });

  it('should delete only monthly', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      yield* m.create(
        [
          {
            milestoneId,
            targetType: 'daily',
            targetDate: LocalDate.make(dailyDate),
            targetYm: monthlyYm,
          },
          {
            milestoneId,
            targetType: 'monthly',
            targetYm: monthlyYm,
            targetDate: LocalDate.make(otherDailyDate),
          },
        ],
        testOwner,
      );

      yield* m.deleteByMilestoneIdAndTargetDate(milestoneId, dailyDate, true);

      const remain = yield* m.findByMilestoneIdAndTargetDate(
        milestoneId,
        dailyDate,
        false,
      );

      expect(remain.length).toBe(1);
      expect(remain[0].targetType).toBe('daily');
    });

    await testRunner(program, TestLayer);
  });

  it('should return 0 when deleting non-existing', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const m = repo.milestoneDaily;

      const result = yield* m.deleteByMilestoneIdAndTargetDate(
        'NOT_EXIST',
        dailyDate,
        false,
      );

      expect(Number(result)).toBe(0);
    });

    await testRunner(program, TestLayer);
  });
});
