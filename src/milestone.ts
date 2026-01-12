import {
  gyomu_milestone_daily,
  gyomu_milestone_cdtbl,
  Prisma,
} from './generated/prisma/client';
import { format } from 'date-fns';
import { DateNFOption } from 'xlsx';
import prisma from './dbsingleton';
import { CriticalError, DBError } from './errors';
import { Failure, PromiseResult, success } from './result';
import { polling } from './timer';
import { genericDBFunction } from './dbutil';

interface MilestoneExistResultType {
  exists: boolean;
  updateTime: Date | undefined;
}
export class Milestone {
  static async exists(
    milestoneId: string,
    targetDate: Date,
    isMonthly = false
  ): PromiseResult<MilestoneExistResultType, DBError> {
    let targetDateYYYYMMDD = this.#convertTargetDate(targetDate, isMonthly);
    return await genericDBFunction<MilestoneExistResultType>(
      'check gyomu_milestone_daily existence',
      async (milestoneId, targetDate, isMonthly) => {
        const record = await prisma.gyomu_milestone_daily.findUnique({
          where: {
            target_date_milestone_id: {
              milestone_id: milestoneId,
              target_date: targetDateYYYYMMDD,
            },
          },
        });
        if (!!record)
          return success({
            exists: true,
            updateTime: new Date(Number(record.update_time)),
          });
        else return success({ exists: false, updateTime: undefined });
      },
      [milestoneId, targetDate, isMonthly]
    );
  }

  static async register(
    milestoneId: string,
    targetDate: Date,
    isMonthly = false
  ) {
    const existsResult = await this.exists(milestoneId, targetDate, isMonthly);
    if (existsResult.isFailure()) return existsResult;
    if (existsResult.value.exists)
      return success(new Date(Number(existsResult.value.updateTime)));

    let targetDateYYYYMMDD = this.#convertTargetDate(targetDate, isMonthly);
    return await genericDBFunction<Date>(
      'register gyomu_milestone_daily record',
      async (milestoneId, targetDate, isMonthly) => {
        const result = await prisma.gyomu_milestone_daily.create({
          data: { milestone_id: milestoneId, target_date: targetDateYYYYMMDD },
        });
        return success(new Date(Number(result.update_time)));
      },
      [milestoneId, targetDate, isMonthly]
    );
  }

  static #convertTargetDate(targetDate: Date, isMonthly: boolean) {
    let targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');
    if (isMonthly) {
      targetDateYYYYMMDD = format(targetDate, 'yyyyMM') + '**';
    }
    return targetDateYYYYMMDD;
  }

  static async wait(
    milestoneId: string,
    targetDate: Date,
    timeoutSecond: number
  ) {
    let interval: number = 5;
    if (timeoutSecond < 60) interval = 1;
    return await polling<DBError>(
      `Wait for milestone ${milestoneId} on ${format(
        targetDate,
        'yyyyMMdd'
      )} to be on`,
      timeoutSecond,
      interval,
      async (milestoneId, targetDate) => {
        const existsResult = await this.exists(milestoneId, targetDate);
        if (existsResult.isFailure()) return existsResult;

        return success(existsResult.value.exists);
      },
      milestoneId,
      targetDate
    );
  }

  static async retrieveMilestoneDailyList(targetDateYYYYMMDD: string) {
    const targetDateMonthly = targetDateYYYYMMDD.substring(0, 6) + '**';
    return genericDBFunction(
      'search milestone_daily',
      async (targetDateYYYYMMDD: string, targetDateMonthly: string) => {
        const records = await prisma.gyomu_milestone_daily.findMany({
          where: {
            OR: [
              {
                target_date: targetDateYYYYMMDD,
              },
              { target_date: targetDateMonthly },
            ],
          },
        });
        return success(records);
      },
      [targetDateYYYYMMDD, targetDateMonthly]
    );
  }

  static async deleteMilestoneDaily(
    milestoneId: string,
    targetDateYYYYMMDD: string
  ) {
    return await genericDBFunction(
      'delete gyomu_milestone_daily',
      async (milestoneId: string, targetDateYYYYMMDD: string) => {
        const deletedRecord = await prisma.gyomu_milestone_daily.delete({
          where: {
            target_date_milestone_id: {
              milestone_id: milestoneId,
              target_date: targetDateYYYYMMDD,
            },
          },
        });
        return success(deletedRecord);
      },
      [milestoneId, targetDateYYYYMMDD]
    );
  }

  static async milestoneList() {
    return await genericDBFunction<gyomu_milestone_cdtbl[]>(
      'retrieve gyomu_milestone_cdtbl records',
      async () => {
        const records = await prisma.gyomu_milestone_cdtbl.findMany();
        return success(records);
      },
      []
    );
  }

  static async upsertMilestoneCode(
    record: gyomu_milestone_cdtbl,
    milestoneId?: string
  ) {
    let needCreate: boolean = true;
    if (!!milestoneId) {
      const result = await genericDBFunction<boolean>(
        'check existence of gyomu_milestone_cdtbl record',
        async (milestoneId: string) => {
          const record = await prisma.gyomu_milestone_cdtbl.findUnique({
            where: { milestone_id: milestoneId },
          });
          return success(!!record);
        },
        [milestoneId]
      );
      if (result.isFailure()) return result;
      needCreate = !result.value;
    }

    return await genericDBFunction<gyomu_milestone_cdtbl>(
      'Insert gyomu_milestone_cdtbl record',
      async (
        record: gyomu_milestone_cdtbl,
        needCreate: boolean,
        milestoneId?: string
      ) => {
        let result: gyomu_milestone_cdtbl;
        if (needCreate) {
          result = await prisma.gyomu_milestone_cdtbl.create({
            data: record,
          });
        } else {
          result = await prisma.gyomu_milestone_cdtbl.update({
            data: record,
            where: { milestone_id: milestoneId },
          });
        }

        return success(result);
      },
      [record, needCreate, milestoneId]
    );
  }

  static async deleteMilestoneCode(milestoneId: string) {
    return await genericDBFunction<gyomu_milestone_cdtbl>(
      'delete gyomu_milestone_cdtbl record',
      async (milestoneId: string) => {
        const result = await prisma.gyomu_milestone_cdtbl.delete({
          where: { milestone_id: milestoneId },
        });
        return success(result);
      },
      [milestoneId]
    );
  }
}
