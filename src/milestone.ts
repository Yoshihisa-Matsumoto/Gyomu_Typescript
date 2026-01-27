import {
  gyomu_milestone_daily,
  gyomu_milestone_cdtbl,
} from './generated/prisma/client';
import { format } from 'date-fns';
import prisma from './dbsingleton';
import {  DBError } from './errors';
//import { Failure, PromiseResult, success } from './result';
import {okAsync, ResultAsync} from './result';
import { polling } from './timer';
import { genericDBFunction } from './dbutil';

interface MilestoneExistResultType {
  exists: boolean;
  updateTime: Date | undefined;
}
export class Milestone {
  static exists(
    milestoneId: string,
    targetDate: Date,
    isMonthly = false
  ): ResultAsync<MilestoneExistResultType, DBError> {
    const targetDateYYYYMMDD = this.#convertTargetDate(targetDate, isMonthly);
    return genericDBFunction(
      'check gyomu_milestone_daily existence',
       async (milestoneId: string, targetDateYYYYMMDD: string) => {
        return prisma.gyomu_milestone_daily.findUnique({
          where: {
            target_date_milestone_id: {
              milestone_id: milestoneId,
              target_date: targetDateYYYYMMDD,
            },
          },
        });
      },
      [milestoneId, targetDateYYYYMMDD]
    ).map((record) => {
      if (record) {
        return {
          exists: true,
          updateTime: new Date(Number(record.update_time)),
        };
      }
      return { exists: false, updateTime: undefined };
    });
  }

  static register(
    milestoneId: string,
    targetDate: Date,
    isMonthly = false
  ): ResultAsync<Date, DBError> {

    const targetDateYYYYMMDD =
      this.#convertTargetDate(targetDate, isMonthly);

    return this.exists(milestoneId, targetDate, isMonthly)
      .andThen((existsResult) => {
        // すでに存在する場合
        if (existsResult.exists) {
          return okAsync(
            new Date(Number(existsResult.updateTime))
          );
        }

        // 存在しない場合 → 登録
        return genericDBFunction(
          'register gyomu_milestone_daily record',
          async (milestoneId, targetDateYYYYMMDD) =>
            prisma.gyomu_milestone_daily.create({
              data: {
                milestone_id: milestoneId,
                target_date: targetDateYYYYMMDD,
              },
            }),
          [milestoneId, targetDateYYYYMMDD]
        ).map(
          (result) =>
            new Date(Number(result.update_time))
        );
      });
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
    const interval = timeoutSecond < 60 ? 1 : 5;

    return polling<DBError>(
      `Wait for milestone ${milestoneId} on ${format(
        targetDate,
        'yyyyMMdd'
      )} to be on`,
      timeoutSecond,
      interval,
      (milestoneId, targetDate) =>
        this.exists(milestoneId, targetDate)
          .map(result => result.exists),
      milestoneId,
      targetDate
    );
  }

  static retrieveMilestoneDailyList(
    targetDateYYYYMMDD: string
  ): ResultAsync<gyomu_milestone_daily[], DBError> {

    const targetDateMonthly = targetDateYYYYMMDD.substring(0, 6) + '**';

    return genericDBFunction(
      'search milestone_daily',
      async (targetDateYYYYMMDD, targetDateMonthly) =>
        prisma.gyomu_milestone_daily.findMany({
          where: {
            OR: [
              { target_date: targetDateYYYYMMDD },
              { target_date: targetDateMonthly },
            ],
          },
        }),
      [targetDateYYYYMMDD, targetDateMonthly]
    );
  }

  static deleteMilestoneDaily(
    milestoneId: string,
    targetDateYYYYMMDD: string
  ): ResultAsync<gyomu_milestone_daily, DBError> {

    return genericDBFunction(
      'delete gyomu_milestone_daily',
      async (milestoneId, targetDateYYYYMMDD) =>
        prisma.gyomu_milestone_daily.delete({
          where: {
            target_date_milestone_id: {
              milestone_id: milestoneId,
              target_date: targetDateYYYYMMDD,
            },
          },
        }),
      [milestoneId, targetDateYYYYMMDD]
    );
  }

  static milestoneList() {
    return genericDBFunction<gyomu_milestone_cdtbl[]>(
      'retrieve gyomu_milestone_cdtbl records',
      async () => 
        prisma.gyomu_milestone_cdtbl.findMany(),
      []
    );
  }

static upsertMilestoneCode(
    record: gyomu_milestone_cdtbl,
    milestoneId?: string
  ): ResultAsync<gyomu_milestone_cdtbl, DBError> {

    const checkExistence = milestoneId
      ? genericDBFunction<boolean>(
          'check existence of gyomu_milestone_cdtbl record',
          async (milestoneId) =>
            prisma.gyomu_milestone_cdtbl
              .findUnique({ where: { milestone_id: milestoneId } })
              .then(r => !!r),
          [milestoneId]
        )
      : okAsync(false);

    return checkExistence.andThen(needCreate =>
      genericDBFunction<gyomu_milestone_cdtbl>(
        needCreate
          ? 'insert gyomu_milestone_cdtbl record'
          : 'update gyomu_milestone_cdtbl record',
        async (milestoneId) =>
          needCreate
            ? prisma.gyomu_milestone_cdtbl.create({ data: record })
            : prisma.gyomu_milestone_cdtbl.update({
                data: record,
                where: { milestone_id: milestoneId! },
              }),
        []
      )
    );
  }

  static deleteMilestoneCode(milestoneId: string) {
    return genericDBFunction<gyomu_milestone_cdtbl>(
      'delete gyomu_milestone_cdtbl record',
      async (milestoneId) =>
        prisma.gyomu_milestone_cdtbl.delete({
          where: { milestone_id: milestoneId },
        }),
      [milestoneId]
    );
  }
}
