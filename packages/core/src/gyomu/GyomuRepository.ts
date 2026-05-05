import { Effect, Layer, Context } from 'effect';
import {
  AppInfoSchema,
  MarketHolidaySchema,
  MilestoneDailySchema,
  MilestoneSchema,
  ParameterMasterSchema,
  StatusHandlerSchema,
  StatusInformationSchema,
  StatusTypeSchema,
} from '../schemas/gyomu.js';
import { DBError } from '../errors.js';
import { LocalDate, YearMonth } from '@gyomu/shared/entity';
import {
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  CrudRepositoryFromSchemasWithFindByColumn,
} from '../data/crud/index.js';
import { SchemaValidationError } from '../../../shared/src/error/SchemaValidationError.js';

export class GyomuRepository extends Context.Service<
  GyomuRepository,
  {
    readonly appInfo: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof AppInfoSchema,
      'description',
      'findByDescription'
    >;
    readonly statusType: CrudRepositoryFromSchemasWithFindAll<
      typeof StatusTypeSchema
    >;
    readonly statusHandler: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof StatusHandlerSchema,
      'application_id',
      'findByApplicationId'
    >;
    readonly statusInfo: CrudRepositoryFromSchemasWithFindByColumn<
      typeof StatusInformationSchema,
      'application_id',
      'findByApplicationId'
    >;
    readonly marketHoliday: CrudRepositoryFromSchemasWithFindByColumn<
      typeof MarketHolidaySchema,
      'market',
      'findByMarket'
    > & {
      findDistinctMarkets: () => Effect.Effect<
        string[],
        DBError | SchemaValidationError
      >;
    };
    readonly milestone: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof MilestoneSchema,
      'milestone_id',
      'findByMilestoneId'
    >;
    readonly milestoneDaily: CrudRepositoryFromSchemasWithFindByColumn<
      typeof MilestoneDailySchema,
      'target_date',
      'findByTargetDate'
    > & {
      findByMilestoneIdAndTargetDate: (
        milestoneId: string,
        targetDate: LocalDate,
        isMonthly: boolean,
      ) => Effect.Effect<
        (typeof MilestoneDailySchema.types._select)[],
        DBError | SchemaValidationError
      >;
      findByTargetDateAndMonthlyDate: (
        targetDate: LocalDate,
        monthlyYm: YearMonth,
      ) => Effect.Effect<
        (typeof MilestoneDailySchema.types._select)[],
        DBError | SchemaValidationError
      >;
      deleteByMilestoneIdAndTargetDate: (
        milestoneId: string,
        targetDate: LocalDate,
        isMonthly: boolean,
      ) => Effect.Effect<number, DBError>;
    };
    readonly parameterMaster: CrudRepositoryFromSchemasWithFindByColumn<
      typeof ParameterMasterSchema,
      'item_key',
      'findByItemKey'
    > & {
      updateValueByItemKey: (
        itemKey: string,
        newValue: string,
      ) => Effect.Effect<number, DBError | SchemaValidationError>;
      deleteByItemKey: (itemKey: string) => Effect.Effect<number, DBError>;
    };
  }
>()('GyomuRepository') {}
