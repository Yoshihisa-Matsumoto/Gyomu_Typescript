import { Effect, Layer } from 'effect';
import { Milestone } from '../milestone.js';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { GyomuRepository } from '../effect/gyomu/gyomuRepository.js';
import { MainLayer } from '../effect/infrastructure/layer.js';
import { ConfigLayer } from '../effect/infrastructure/config.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../effect/infrastructure/runtime.js';

const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';
const testTime = '2026-10-28T00:00:00.000Z';
beforeEach(() => {});
describe('Milestone access check', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetYmd = '2001-01-01';
  it('Milestone should not exist', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        customQuery: () => Effect.succeed([]),
      },
    } as any);
    const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer)
      .pipe(Layer.provideMerge(GyomuRepositoryMock))
      // .pipe(Layer.provideMerge(KyselyService.live))
      .pipe(Layer.provideMerge(NodeFileSystem.layer));
    const testRunner = makeRunner(TestLayer);
    const result = await testRunner(Milestone.exists(milestoneId, targetYmd));

    expect(result.exists).toBeFalsy();
  });
  it('Milestone should  exist', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        customQuery: () =>
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
    const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer)
      .pipe(Layer.provideMerge(GyomuRepositoryMock))
      // .pipe(Layer.provideMerge(KyselyService.live))
      .pipe(Layer.provideMerge(NodeFileSystem.layer));
    const testRunner = makeRunner(TestLayer);
    const result = await testRunner(Milestone.exists(milestoneId, targetYmd));

    expect(result.exists).toBeTruthy();
    if (result.exists) {
      expect(result.updateTime).not.toBeUndefined();
    }
  });
  it('Monthly Milestone test', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        customQuery: () =>
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
    const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer)
      .pipe(Layer.provideMerge(GyomuRepositoryMock))
      // .pipe(Layer.provideMerge(KyselyService.live))
      .pipe(Layer.provideMerge(NodeFileSystem.layer));
    const testRunner = makeRunner(TestLayer);
    const result = await testRunner(Milestone.exists(milestoneId, targetYmd));

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
      customQuery: () => Effect.succeed([]),
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
  const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer)
    .pipe(Layer.provideMerge(GyomuRepositoryMock))
    // .pipe(Layer.provideMerge(KyselyService.live))
    .pipe(Layer.provideMerge(NodeFileSystem.layer));
  const testRunner = makeRunner(TestLayer);
  const result = await testRunner(Milestone.register(milestoneId, targetYmd));

  expect(result).toBe(testTime);
});

describe('Milestone wait test', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetYmd = '2001-01-01';

  it('should return with false without milestone', async () => {
    const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
      milestoneDaily: {
        customQuery: () => Effect.succeed([]),
      },
    } as any);
    const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer)
      .pipe(Layer.provideMerge(GyomuRepositoryMock))
      // .pipe(Layer.provideMerge(KyselyService.live))
      .pipe(Layer.provideMerge(NodeFileSystem.layer));
    const testRunner = makeRunner(TestLayer);
    const result = await testRunner(Milestone.wait(milestoneId, targetYmd, 1));
    expect(result).toBeFalsy();
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
