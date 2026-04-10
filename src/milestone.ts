import { format } from 'date-fns';
import { polling } from './timer.js';
import { Effect, Layer, ServiceMap } from 'effect';
import { GyomuRepository } from './effect/gyomu/gyomuRepository.js';
import {
  MilestoneDailySchema,
  MilestoneSchema,
} from './effect/schemas/gyomu.js';
import { DBError, TimeoutError } from './errors.js';

type MilestoneExistResultType =
  | {
      exists: true;
      updateTime: string;
    }
  | {
      exists: false;
    };

const convertTargetDate = (targetDate: string, isMonthly: boolean) => {
  let targetDateYmD = targetDate;
  if (isMonthly) {
    targetDateYmD = targetDate.substring(0, 8) + '**';
  }
  return targetDateYmD;
};

export class MilestoneService extends ServiceMap.Service<
  MilestoneService,
  {
    exists: (
      milestoneId: string,
      targetYmd: string,
      isMonthly?: boolean,
    ) => Effect.Effect<MilestoneExistResultType, DBError, GyomuRepository>;
    register: (
      milestoneId: string,
      targetYmd: string,
      isMonthly?: boolean,
    ) => Effect.Effect<string, DBError, GyomuRepository>;
    wait: (
      milestoneId: string,
      targetYmd: string,
      timeoutSecond: number,
    ) => Effect.Effect<boolean, TimeoutError, GyomuRepository>;
    retrieveMilestoneDailyList: (
      targetDateYmd: string,
    ) => Effect.Effect<
      readonly (typeof MilestoneDailySchema.types._select)[],
      DBError,
      GyomuRepository
    >;
    deleteMilestoneDaily: (
      milestoneId: string,
      targetDateYmd: string,
    ) => Effect.Effect<bigint, DBError, GyomuRepository>;
    milestoneList: () => Effect.Effect<
      readonly (typeof MilestoneSchema.types._select)[],
      DBError,
      GyomuRepository
    >;
    upsertMilestoneCode: (
      milestoneId: string,
      description: string,
    ) => Effect.Effect<
      typeof MilestoneSchema.types._select,
      DBError,
      GyomuRepository
    >;
    deleteMilestoneCode: (
      milestoneId: string,
    ) => Effect.Effect<void, DBError, GyomuRepository>;
  }
>()('MilestoneService', {
  make: Effect.gen(function* () {
    const repo = yield* GyomuRepository;
    const existFunc = (
      milestoneId: string,
      targetYmd: string,
      isMonthly = false,
    ): Effect.Effect<MilestoneExistResultType, DBError, GyomuRepository> => {
      const targetDateYmd = convertTargetDate(targetYmd, isMonthly);
      return repo.milestoneDaily
        .findByMilestoneIdAndTargetDate(milestoneId, targetDateYmd)
        .pipe(
          Effect.map((records) => {
            if (records.length > 0) {
              return {
                exists: true,
                updateTime: records[0].modifiedAt,
              };
            }
            return { exists: false };
          }),
        );
    };
    return {
      exists: existFunc,
      register: (
        milestoneId: string,
        targetYmd: string,
        isMonthly = false,
      ): Effect.Effect<string, DBError, GyomuRepository> => {
        const targetYmdForRecord = convertTargetDate(targetYmd, isMonthly);

        return Effect.gen(function* () {
          const existsResult = yield* existFunc(
            milestoneId,
            targetYmdForRecord,
          );
          if (existsResult.exists) {
            return existsResult.updateTime;
          }
          const result = yield* repo.milestoneDaily.create([
            { milestoneId, targetDate: targetYmdForRecord },
          ]);
          return result[0].modifiedAt;
        });
      },
      wait: (
        milestoneId: string,
        targetYmd: string,
        timeoutSecond: number,
      ): Effect.Effect<boolean, TimeoutError, GyomuRepository> => {
        const interval = timeoutSecond < 60 ? 1 : 5;

        return polling(
          `Wait for milestone ${milestoneId} on ${format(
            targetYmd,
            'yyyyMMdd',
          )} to be on`,
          timeoutSecond,
          interval,
          (milestoneId, targetYmd) =>
            existFunc(milestoneId, targetYmd).pipe(
              Effect.map((result) => result.exists),
            ),
          milestoneId,
          targetYmd,
        );
      },
      retrieveMilestoneDailyList: (
        targetDateYmd: string,
      ): Effect.Effect<
        readonly (typeof MilestoneDailySchema.types._select)[],
        DBError,
        GyomuRepository
      > => {
        const targetDateMonthly = targetDateYmd.substring(0, 8) + '**';

        return Effect.gen(function* () {
          return yield* repo.milestoneDaily.findByTargetDateAndMonthlyDate(
            targetDateYmd,
            targetDateMonthly,
          );
        });
      },
      deleteMilestoneDaily: (
        milestoneId: string,
        targetDateYmd: string,
      ): Effect.Effect<bigint, DBError, GyomuRepository> => {
        return Effect.gen(function* () {
          return yield* repo.milestoneDaily.deleteByMilestoneIdAndTargetDate(
            milestoneId,
            targetDateYmd,
          );
        });
      },
      milestoneList: (): Effect.Effect<
        readonly (typeof MilestoneSchema.types._select)[],
        DBError,
        GyomuRepository
      > => {
        return Effect.gen(function* () {
          return yield* repo.milestone.findAll();
        });
      },
      upsertMilestoneCode: (
        milestoneId: string,
        description: string,
      ): Effect.Effect<
        typeof MilestoneSchema.types._select,
        DBError,
        GyomuRepository
      > => {
        return Effect.gen(function* () {
          const targetRecords =
            yield* repo.milestone.findByMilestoneId(milestoneId);
          if (targetRecords.length > 0) {
            return (yield* repo.milestone.updateRecords([
              { id: targetRecords[0].id, milestoneId, description },
            ]))[0];
          } else {
            return (yield* repo.milestone.create([
              { description, milestoneId },
            ]))[0];
          }
        });
      },
      deleteMilestoneCode: (
        milestoneId: string,
      ): Effect.Effect<void, DBError, GyomuRepository> => {
        return Effect.gen(function* () {
          const targetRecords =
            yield* repo.milestone.findByMilestoneId(milestoneId);
          yield* repo.milestone.deleteRecords(targetRecords.map((r) => r.id));
        });
      },
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
// export class MilestoneA {
//   static exists(
//     milestoneId: string,
//     targetYmd: string,
//     isMonthly = false,
//   ): Effect.Effect<MilestoneExistResultType, DBError, GyomuRepository> {
//     const targetDateYmd = convertTargetDate(targetYmd, isMonthly);
//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       return yield* repo.milestoneDaily.findByMilestoneIdAndTargetDate(
//         milestoneId,
//         targetDateYmd,
//       );
//     }).pipe(
//       Effect.map((records) => {
//         if (records.length > 0) {
//           return {
//             exists: true,
//             updateTime: records[0].modifiedAt,
//           };
//         }
//         return { exists: false };
//       }),
//     );
//     // return genericDBFunction(
//     //   'check gyomu_milestone_daily existence',
//     //   async (milestoneId: string, targetDateYYYYMMDD: string) => {
//     //     return prisma.gyomu_milestone_daily.findUnique({
//     //       where: {
//     //         target_date_milestone_id: {
//     //           milestone_id: milestoneId,
//     //           target_date: targetDateYYYYMMDD,
//     //         },
//     //       },
//     //     });
//     //   },
//     //   [milestoneId, targetDateYmd],
//     // ).map((record) => {
//     //   if (record) {
//     //     return {
//     //       exists: true,
//     //       updateTime: new Date(Number(record.update_time)),
//     //     };
//     //   }
//     //   return { exists: false, updateTime: undefined };
//     // });
//   }

//   static register(
//     milestoneId: string,
//     targetYmd: string,
//     isMonthly = false,
//   ): Effect.Effect<string, DBError, GyomuRepository> {
//     const targetYmdForRecord = convertTargetDate(targetYmd, isMonthly);
//     const existFunc = this.exists;
//     return Effect.gen(function* () {
//       const existsResult = yield* existFunc(milestoneId, targetYmd, isMonthly);
//       if (existsResult.exists) {
//         return existsResult.updateTime;
//       }
//       const repo = yield* GyomuRepository;
//       const result = yield* repo.milestoneDaily.create([
//         { milestoneId, targetDate: targetYmdForRecord },
//       ]);
//       return result[0].modifiedAt;
//     });
//   }

//   static wait(milestoneId: string, targetYmd: string, timeoutSecond: number) {
//     const interval = timeoutSecond < 60 ? 1 : 5;

//     return polling(
//       `Wait for milestone ${milestoneId} on ${format(
//         targetYmd,
//         'yyyyMMdd',
//       )} to be on`,
//       timeoutSecond,
//       interval,
//       (milestoneId, targetYmd) =>
//         this.exists(milestoneId, targetYmd).pipe(
//           Effect.map((result) => result.exists),
//         ),
//       milestoneId,
//       targetYmd,
//     );
//   }

//   static retrieveMilestoneDailyList(
//     targetDateYmd: string,
//   ): Effect.Effect<
//     readonly (typeof MilestoneDailySchema.types._select)[],
//     DBError,
//     GyomuRepository
//   > {
//     const targetDateMonthly = targetDateYmd.substring(0, 8) + '**';

//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       return yield* repo.milestoneDaily.findByTargetDateAndMonthlyDate(
//         targetDateYmd,
//         targetDateMonthly,
//       );
//     });
//   }

//   static deleteMilestoneDaily(
//     milestoneId: string,
//     targetDateYmd: string,
//   ): Effect.Effect<bigint, DBError, GyomuRepository> {
//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       return yield* repo.milestoneDaily.deleteByMilestoneIdAndTargetDate(
//         milestoneId,
//         targetDateYmd,
//       );
//     });
//   }

//   static milestoneList(): Effect.Effect<
//     readonly (typeof MilestoneSchema.types._select)[],
//     DBError,
//     GyomuRepository
//   > {
//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       return yield* repo.milestone.findAll();
//     });
//   }

//   static upsertMilestoneCode(
//     milestoneId: string,
//     description: string,
//   ): Effect.Effect<
//     typeof MilestoneSchema.types._select,
//     DBError,
//     GyomuRepository
//   > {
//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       const targetRecords =
//         yield* repo.milestone.findByMilestoneId(milestoneId);
//       if (targetRecords.length > 0) {
//         return (yield* repo.milestone.updateRecords([
//           { id: targetRecords[0].id, milestoneId, description },
//         ]))[0];
//       } else {
//         return (yield* repo.milestone.create([
//           { description, milestoneId },
//         ]))[0];
//       }
//     });
//   }

//   static deleteMilestoneCode(milestoneId: string) {
//     return Effect.gen(function* () {
//       const repo = yield* GyomuRepository;
//       const targetRecords =
//         yield* repo.milestone.findByMilestoneId(milestoneId);
//       yield* repo.milestone.deleteRecords(targetRecords.map((r) => r.id));
//     });
//   }
// }
