import { format } from 'date-fns';
import { polling } from '../../shared/effect/timer.js';
import { Effect, Layer, Schema, ServiceMap } from 'effect';
import { GyomuRepository } from '../GyomuRepository.js';
import { MilestoneDailySchema, MilestoneSchema } from '../../schemas/gyomu.js';
import { DBError, TimeoutError } from '../../errors.js';
import { convertToSchemaObjectWithEffect } from '@gyomu/shared/entity';
import {
  LocalDate,
  LocalDateSchema,
  YearMonth,
  YearMonthSchema,
} from '@gyomu/shared/entity';
import { MilestoneDailyDomainSchema } from '@gyomu/shared/entity';
import { SchemaValidationError } from '../../../../shared/src/error/SchemaValidationError.js';

export type MilestoneExistResultType =
  | {
      exists: true;
      updateTime: string;
    }
  | {
      exists: false;
    };

// const convertTargetDate = (targetDate: string, isMonthly: boolean) => {
//   let targetDateYmD = targetDate;
//   if (isMonthly) {
//     targetDateYmD = targetDate.substring(0, 8) + '**';
//   }
//   return targetDateYmD;
// };

export class MilestoneService extends ServiceMap.Service<
  MilestoneService,
  {
    exists: (
      milestoneId: string,
      targetYmd: LocalDate,
      isMonthly?: boolean,
    ) => Effect.Effect<
      MilestoneExistResultType,
      DBError | SchemaValidationError,
      GyomuRepository
    >;
    register: (
      milestoneId: string,
      targetYmd: LocalDate,
      isMonthly?: boolean,
    ) => Effect.Effect<
      string,
      DBError | SchemaValidationError,
      GyomuRepository
    >;
    wait: (
      milestoneId: string,
      targetYmd: LocalDate,
      timeoutSecond: number,
    ) => Effect.Effect<boolean, TimeoutError, GyomuRepository>;
    retrieveMilestoneDailyList: (
      targetDateYmd: LocalDate,
    ) => Effect.Effect<
      Schema.Schema.Type<typeof MilestoneDailyDomainSchema>[],
      DBError | SchemaValidationError,
      GyomuRepository
    >;
    deleteMilestoneDaily: (
      milestoneId: string,
      targetDateYmd: LocalDate,
    ) => Effect.Effect<number, DBError, GyomuRepository>;
    milestoneList: () => Effect.Effect<
      readonly (typeof MilestoneSchema.types._select)[],
      DBError | SchemaValidationError,
      GyomuRepository
    >;
    upsertMilestoneCode: (
      milestoneId: string,
      description: string,
    ) => Effect.Effect<
      typeof MilestoneSchema.types._select,
      DBError | SchemaValidationError,
      GyomuRepository
    >;
    deleteMilestoneCode: (
      milestoneId: string,
    ) => Effect.Effect<void, DBError, GyomuRepository>;
  }
>()('MilestoneService') {}
