import { Context } from 'effect'
import type { Effect } from 'effect'
import type {
  AppInfoSchema,
  MarketHolidaySchema,
  MilestoneDailySchema,
  MilestoneSchema,
  ParameterMasterSchema,
  StatusHandlerSchema,
  StatusInformationSchema,
  StatusTypeSchema,
} from '../schemas/gyomu.js'
import type {
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  CrudRepositoryFromSchemasWithFindByColumn,
} from '../data/index.js'
import type { DBError } from '../error/DBError.js'
import type { SchemaValidationError } from '../error/SchemaValidationError.js'
import type { LocalDate, YearMonth } from '../entity/date.js'

/**
 * A repository service for managing Gyomu-related domain entities, providing CRUD operations for AppInfo, StatusType, StatusHandler, StatusInformation, MarketHoliday, Milestone, MilestoneDaily, and ParameterMaster schemas.
 */
export class GyomuRepository extends Context.Service<
  GyomuRepository,
  {
    readonly appInfo: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof AppInfoSchema,
      'description',
      'findByDescription'
    >
    readonly statusType: CrudRepositoryFromSchemasWithFindAll<typeof StatusTypeSchema>
    readonly statusHandler: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof StatusHandlerSchema,
      'application_id',
      'findByApplicationId'
    >
    readonly statusInfo: CrudRepositoryFromSchemasWithFindByColumn<
      typeof StatusInformationSchema,
      'application_id',
      'findByApplicationId'
    >
    readonly marketHoliday: CrudRepositoryFromSchemasWithFindByColumn<
      typeof MarketHolidaySchema,
      'market',
      'findByMarket'
    > & {
      findDistinctMarkets: () => Effect.Effect<Array<string>, DBError | SchemaValidationError>
    }
    readonly milestone: CrudRepositoryFromSchemasWithFindAllAndFindByColumn<
      typeof MilestoneSchema,
      'milestone_id',
      'findByMilestoneId'
    >
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
        Array<typeof MilestoneDailySchema.types._select>,
        DBError | SchemaValidationError
      >
      findByTargetDateAndMonthlyDate: (
        targetDate: LocalDate,
        monthlyYm: YearMonth,
      ) => Effect.Effect<
        Array<typeof MilestoneDailySchema.types._select>,
        DBError | SchemaValidationError
      >
      deleteByMilestoneIdAndTargetDate: (
        milestoneId: string,
        targetDate: LocalDate,
        isMonthly: boolean,
      ) => Effect.Effect<number, DBError>
    }
    readonly parameterMaster: CrudRepositoryFromSchemasWithFindByColumn<
      typeof ParameterMasterSchema,
      'item_key',
      'findByItemKey'
    > & {
      updateValueByItemKey: (
        itemKey: string,
        newValue: string,
      ) => Effect.Effect<number, DBError | SchemaValidationError>
      deleteByItemKey: (itemKey: string) => Effect.Effect<number, DBError>
    }
  }
>()('GyomuRepository') {}
