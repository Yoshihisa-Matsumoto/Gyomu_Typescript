import { prismaMock } from './baseDBClass';
import { Milestone } from '../milestone';
import { createDateFromYYYYMMDD } from '../dateOperation';
import { format } from 'date-fns';
import { beforeEach, expect, test } from 'vitest';

beforeEach(() => {});
test('Milestone access check', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetDate = createDateFromYYYYMMDD('20010101');
  prismaMock.gyomu_milestone_daily.findUnique.mockResolvedValue(null);
  let result = await Milestone.exists(milestoneId, targetDate);
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value.exists).toBeFalsy();
  expect(result.value.updateTime).toBeUndefined();

  prismaMock.gyomu_milestone_daily.findUnique.mockResolvedValue({
    milestone_id: milestoneId,
    target_date: format(targetDate, 'yyyyMMdd'),
    update_time: BigInt(1),
  });
  result = await Milestone.exists(milestoneId, targetDate);
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value.exists).toBeTruthy();
  expect(result.value.updateTime).not.toBeUndefined();

  prismaMock.gyomu_milestone_daily.findUnique.mockResolvedValue({
    milestone_id: milestoneId,
    target_date: format(targetDate, 'yyyyMM') + '**',
    update_time: BigInt(1),
  });
  result = await Milestone.exists(milestoneId, targetDate, true);
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value.exists).toBeTruthy();
  expect(result.value.updateTime).not.toBeUndefined();
});

test('Milestone register test', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetDate = createDateFromYYYYMMDD('20010101');

  prismaMock.gyomu_milestone_daily.create.mockResolvedValue({
    milestone_id: milestoneId,
    target_date: format(targetDate, 'yyyyMMdd'),
    update_time: BigInt(1),
  });
  let result = await Milestone.register(milestoneId, targetDate);
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).not.toBeUndefined();
});

test('Milestone wait test', async () => {
  const milestoneId: string = 'TestMilestone';
  const targetDate = createDateFromYYYYMMDD('20010101');

  let result = await Milestone.wait(milestoneId, targetDate, 1);
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).toBeFalsy();

  setTimeout(async () => {
    prismaMock.gyomu_milestone_daily.findUnique.mockResolvedValue({
      milestone_id: milestoneId,
      target_date: format(targetDate, 'yyyyMMdd'),
      update_time: BigInt(1),
    });
  }, 1000);
  let result2 = await Milestone.wait(milestoneId, targetDate, 5);
  if (result2.isErr()) {
    expect(result2.isErr()).toBeFalsy();
    return;
  }
  expect(result2.value).toBeTruthy();
});
