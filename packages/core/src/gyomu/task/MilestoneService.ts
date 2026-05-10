import { Context } from 'effect'
import type { Effect, Schema } from 'effect'
import type { GyomuRepository } from '../GyomuRepository.js'
import type { DBError } from '../../error/DBError.js'
import type { SchemaValidationError } from '../../error/SchemaValidationError.js'
import type { MilestoneSchema } from '../../schemas/gyomu.js'
import type { LocalDate } from '../../entity/date.js'
import type { MilestoneDailyDomainSchema } from '../../entity/gyomuDefinition.js'
import type { TimeoutError } from '../../error/TimeoutError.js'

export type MilestoneExistResultType =
  | {
      exists: true
      updateTime: string
    }
  | {
      exists: false
    }

// const convertTargetDate = (targetDate: string, isMonthly: boolean) => {
//   let targetDateYmD = targetDate;
//   if (isMonthly) {
//     targetDateYmD = targetDate.substring(0, 8) + '**';
//   }
//   return targetDateYmD;
// };

export class MilestoneService extends Context.Service<
  MilestoneService,
  {
    exists: (
      milestoneId: string,
      targetYmd: LocalDate,
      isMonthly?: boolean,
    ) => Effect.Effect<MilestoneExistResultType, DBError | SchemaValidationError, GyomuRepository>
    register: (
      milestoneId: string,
      targetYmd: LocalDate,
      isMonthly?: boolean,
    ) => Effect.Effect<string, DBError | SchemaValidationError, GyomuRepository>
    wait: (
      milestoneId: string,
      targetYmd: LocalDate,
      timeoutSecond: number,
    ) => Effect.Effect<boolean, TimeoutError, GyomuRepository>
    retrieveMilestoneDailyList: (
      targetDateYmd: LocalDate,
    ) => Effect.Effect<
      Array<Schema.Schema.Type<typeof MilestoneDailyDomainSchema>>,
      DBError | SchemaValidationError,
      GyomuRepository
    >
    deleteMilestoneDaily: (
      milestoneId: string,
      targetDateYmd: LocalDate,
    ) => Effect.Effect<number, DBError, GyomuRepository>
    milestoneList: () => Effect.Effect<
      ReadonlyArray<typeof MilestoneSchema.types._select>,
      DBError | SchemaValidationError,
      GyomuRepository
    >
    upsertMilestoneCode: (
      milestoneId: string,
      description: string,
    ) => Effect.Effect<
      typeof MilestoneSchema.types._select,
      DBError | SchemaValidationError,
      GyomuRepository
    >
    deleteMilestoneCode: (milestoneId: string) => Effect.Effect<void, DBError, GyomuRepository>
  }
>()('MilestoneService') {}
