import { Effect, Layer, Ref } from 'effect';
import { MilestoneService } from '../MilestoneService.js';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { GyomuRepository } from '../GyomuRepository.js';
import { makeRunner } from '../../infrastructure/runtime.js';
import { LocalDate } from '../../schemas/date.js';

const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';
const testTime = '2026-10-28T00:00:00.000Z';
beforeEach(() => {});
describe('Milestone access check', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetYmd = '2001-01-01';
  it('Milestone should not exist', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        findByMilestoneIdAndTargetDate: () => Effect.succeed([]),
      },
    } as any);
    const TestLayer = MilestoneService.live.pipe(
      Layer.provide(GyomuRepositoryMock),
    );
    const testRunner = makeRunner(TestLayer);
    const program = Effect.gen(function* () {
      const milestone = yield* MilestoneService;
      return yield* milestone.exists(milestoneId, targetYmd as LocalDate);
    });
    const result = await testRunner(program);

    expect(result.exists).toBeFalsy();
  });
  it('Milestone should  exist', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        findByMilestoneIdAndTargetDate: () =>
          Effect.succeed([
            {
              id: testId,
              milestoneId: milestoneId,
              targetDate: targetYmd,
              modifiedAt: testTime,
              modifiedBy: 'testUser',
            },
          ]),
      },
    } as any);
    const TestLayer = MilestoneService.live.pipe(
      Layer.provide(GyomuRepositoryMock),
    );
    const testRunner = makeRunner(TestLayer);
    const program = Effect.gen(function* () {
      const milestone = yield* MilestoneService;
      return yield* milestone.exists(milestoneId, targetYmd as LocalDate);
    });
    const result = await testRunner(program);

    expect(result.exists).toBeTruthy();
    if (result.exists) {
      expect(result.updateTime).not.toBeUndefined();
    }
  });
  it('Monthly Milestone test', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        findByMilestoneIdAndTargetDate: () =>
          Effect.succeed([
            {
              id: testId,
              milestoneId: milestoneId,
              targetDate: targetYmd.substring(0, 8) + '**',
              modifiedAt: testTime,
              modifiedBy: 'testUser',
            },
          ]),
      },
    } as any);
    const TestLayer = MilestoneService.live.pipe(
      Layer.provide(GyomuRepositoryMock),
    );
    const testRunner = makeRunner(TestLayer);
    const program = Effect.gen(function* () {
      const milestone = yield* MilestoneService;
      return yield* milestone.exists(milestoneId, targetYmd as LocalDate);
    });
    const result = await testRunner(program);

    expect(result.exists).toBeTruthy();
    if (result.exists) {
      expect(result.updateTime).not.toBeUndefined();
    }
  });
});

test('Milestone register test', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetYmd = '2001-01-01';
  const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    milestoneDaily: {
      findByMilestoneIdAndTargetDate: () => Effect.succeed([]),
      create: () =>
        Effect.succeed([
          {
            id: testId,
            milestoneId: milestoneId,
            targetDate: targetYmd,
            modifiedAt: testTime,
            modifiedBy: 'testUser',
          },
        ]),
    },
  } as any);
  const TestLayer = MilestoneService.live.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  const testRunner = makeRunner(TestLayer);
  const program = Effect.gen(function* () {
    const milestone = yield* MilestoneService;
    return yield* milestone.register(milestoneId, targetYmd as LocalDate);
  });
  const result = await testRunner(program);

  expect(result).toBe(testTime);
});

describe('Milestone wait test', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetYmd = '2001-01-01';

  it('should return with false without milestone', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        findByMilestoneIdAndTargetDate: () => Effect.succeed([]),
      },
    } as any);
    const TestLayer = MilestoneService.live.pipe(
      Layer.provide(GyomuRepositoryMock),
    );
    const testRunner = makeRunner(TestLayer);
    const program = Effect.gen(function* () {
      const milestone = yield* MilestoneService;
      return yield* milestone.wait(milestoneId, targetYmd as LocalDate, 1);
    });
    const result = await testRunner(program);
    expect(result).toBeFalsy();
  });

  it('should return with true with milestone after waiting', async () => {
    const GyomuRepositoryMock = Layer.effect(
      GyomuRepository,
      Effect.gen(function* () {
        const ref = yield* Ref.make(0);

        return {
          milestoneDaily: {
            findByMilestoneIdAndTargetDate: () =>
              Ref.updateAndGet(ref, (n) => n + 1).pipe(
                Effect.andThen((count) => {
                  if (count < 3) {
                    return Effect.succeed([]); // 最初は存在しない
                  }
                  return Effect.succeed([
                    {
                      id: testId,
                      milestoneId: milestoneId,
                      targetDate: targetYmd,
                      modifiedAt: testTime,
                      modifiedBy: 'testUser',
                    },
                  ]);
                }),
              ),
          },
        } as any;
      }),
    );
    const TestLayer = MilestoneService.live.pipe(
      Layer.provide(GyomuRepositoryMock),
    );
    const testRunner = makeRunner(TestLayer);
    const program = Effect.gen(function* () {
      const milestone = yield* MilestoneService;
      return yield* milestone.wait(milestoneId, targetYmd as LocalDate, 5);
    });
    const result = await testRunner(program);
    expect(result).toBeTruthy();
  });
  // if (result.isErr()) {
  //   expect(result.isErr()).toBeFalsy();
  //   return;
  // }
  // expect(result.value).toBeFalsy();

  // setTimeout(async () => {
  //   prismaMock.gyomu_milestone_daily.findUnique.mockResolvedValue({
  //     milestone_id: milestoneId,
  //     target_date: format(targetDate, 'yyyyMMdd'),
  //     update_time: BigInt(1),
  //   });
  // }, 1000);
  // const result2 = await Milestone.wait(milestoneId, targetDate, 5);
  // if (result2.isErr()) {
  //   expect(result2.isErr()).toBeFalsy();
  //   return;
  // }
  // expect(result2.value).toBeTruthy();
});
