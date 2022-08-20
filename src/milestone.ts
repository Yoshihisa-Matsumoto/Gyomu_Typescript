import { gyomu_milestone_daily, Prisma } from '@prisma/client';
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
    let targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');
    if (isMonthly) {
      targetDateYYYYMMDD = format(targetDate, 'yyyyMM') + '**';
    }
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
    // try {
    //   let targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');
    //   if (isMonthly) {
    //     targetDateYYYYMMDD = format(targetDate, 'yyyyMM') + '**';
    //   }
    //   const record = await prisma.gyomu_milestone_daily.findUnique({
    //     where: {
    //       target_date_milestone_id: {
    //         milestone_id: milestoneId,
    //         target_date: targetDateYYYYMMDD,
    //       },
    //     },
    //   });
    //   return success(!!record);
    // } catch (e) {
    //   if (
    //     e instanceof Prisma.PrismaClientKnownRequestError ||
    //     e instanceof Prisma.PrismaClientUnknownRequestError ||
    //     e instanceof Prisma.PrismaClientValidationError
    //   ) {
    //     return new Failure(
    //       new DBError('Fail to get data on gyomu_milestone_daily', e)
    //     );
    //   } else if (e instanceof Prisma.PrismaClientRustPanicError) {
    //     throw new CriticalError(
    //       'Critical error on Prisma. Need to terminate the application',
    //       e
    //     );
    //   } else {
    //     return new Failure(
    //       new DBError(
    //         'Unknown failure to get data on gyomu_milestone_daily',
    //         e as Error
    //       )
    //     );
    //   }
    // }
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

    let targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');
    if (isMonthly) {
      targetDateYYYYMMDD = format(targetDate, 'yyyyMM') + '**';
    }
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

  static async wait(
    milestoneId: string,
    targetDate: Date,
    timeoutMinute: number
  ) {
    return await polling<DBError>(
      `Wait for milestone ${milestoneId} on ${format(
        targetDate,
        'yyyyMMdd'
      )} to be on`,
      timeoutMinute * 60,
      5,
      async (milestoneId, targetDate) => {
        const existsResult = await this.exists(milestoneId, targetDate);
        if (existsResult.isFailure()) return existsResult;

        return success(existsResult.value.exists);
      },
      milestoneId,
      targetDate
    );
  }
}
