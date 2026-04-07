import { Effect, Layer, ServiceMap } from 'effect';
import {
  assertDefinitionKeysExistInTable,
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  CrudRepositoryFromSchemasWithFindByColumn,
  makeCustomDelete,
  customSQLAndReturnRecords,
  makeRepositoryFromDb,
} from '../infrastructure/db/common.js';
import {
  appInfoDefinition,
  AppInfoSchema,
  marketHolidayDefinition,
  MarketHolidaySchema,
  milestoneDailyDefinition,
  MilestoneDailySchema,
  milestoneDefinition,
  MilestoneSchema,
  parameterMasterDefinition,
  serviceDefinition,
  serviceTypeDefinition,
  statusHandlerDefinition,
  StatusHandlerSchema,
  statusInformationDefinition,
  StatusInformationSchema,
  statusTypeDefinition,
  StatusTypeSchema,
  taskDataDefinition,
  taskDataLogDefinition,
} from '../schemas/gyomu.js';
import { KyselyService } from '../infrastructure/db/kysely-service.js';
import { DB } from '../../db/db.js';
import { fromPromise } from '../index.js';
import { DBError } from '../../errors.js';

export class GyomuRepository extends ServiceMap.Service<
  GyomuRepository,
  {
    readonly appInfo: CrudRepositoryFromSchemasWithFindAll<
      typeof AppInfoSchema
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
    >;
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
        targetDate: string,
      ) => Effect.Effect<
        (typeof MilestoneDailySchema.types._select)[],
        DBError
      >;
      findByTargetDateAndMonthlyDate: (
        targetDate: string,
        monthlyDate: string,
      ) => Effect.Effect<
        (typeof MilestoneDailySchema.types._select)[],
        DBError
      >;
      deleteByMilestoneIdAndTargetDate: (
        milestoneId: string,
        targetDate: string,
      ) => Effect.Effect<bigint, DBError>;
    };
  }
>()('GyomuRepository', {
  make: Effect.gen(function* () {
    const dbService = yield* KyselyService;
    const db = yield* dbService.withConnection('GYOMU_DB');
    return {
      appInfo: makeRepositoryFromDb(db, {
        table: 'gyomu_apps_info_cdtbl',
        schemas: AppInfoSchema,
        options: {
          findAll: true,
        },
      }),
      statusType: makeRepositoryFromDb(db, {
        table: 'gyomu_status_info',
        schemas: StatusTypeSchema,
        options: {
          findAll: true,
        },
      }),
      statusHandler: makeRepositoryFromDb(db, {
        table: 'gyomu_status_handler',
        schemas: StatusHandlerSchema,
        options: {
          findAll: true,
          findByColumn: {
            columnName: 'application_id',
            methodName: 'findByApplicationId',
          },
        },
      }),
      statusInfo: makeRepositoryFromDb(db, {
        table: 'gyomu_status_info',
        schemas: StatusInformationSchema,
        options: {
          findAll: false,
          findByColumn: {
            columnName: 'application_id',
            methodName: 'findByApplicationId',
          },
        },
      }),
      marketHoliday: makeRepositoryFromDb(db, {
        table: 'gyomu_market_holiday',
        schemas: MarketHolidaySchema,
        options: {
          findAll: false,
          findByColumn: {
            columnName: 'market',
            methodName: 'findByMarket',
          },
        },
      }),
      milestone: makeRepositoryFromDb(db, {
        table: 'gyomu_milestone_cdtbl',
        schemas: MilestoneSchema,
        options: {
          findAll: true,
          findByColumn: {
            columnName: 'milestone_id',
            methodName: 'findByMilestoneId',
          },
        },
      }),
      milestoneDaily: makeRepositoryFromDb(
        db,
        {
          table: 'gyomu_milestone_daily',
          schemas: MilestoneDailySchema,
          options: {
            findByColumn: {
              columnName: 'target_date',
              methodName: 'findByTargetDate',
            },
          },
        },
        ({ db, table, schemas }) => {
          return {
            findByMilestoneIdAndTargetDate: (
              milestoneId: string,
              targetDate: string,
            ) =>
              fromPromise(
                DBError,
                `fail to find ${table} by milestone_id and target_date`,
              )(async () =>
                customSQLAndReturnRecords(
                  db,
                  table,
                  schemas,
                )((ctx) =>
                  ctx.db
                    .selectFrom(table)
                    .selectAll()
                    .where('milestone_id', '=', milestoneId)
                    .where('target_date', '=', targetDate)
                    .execute(),
                ),
              ),
            findByTargetDateAndMonthlyDate: (
              targetYmd: string,
              monthlyYmd: string,
            ) =>
              fromPromise(
                DBError,
                `fail to find ${table} by date = ${targetYmd} or  ${monthlyYmd}`,
              )(async () =>
                customSQLAndReturnRecords(
                  db,
                  table,
                  schemas,
                )((ctx) =>
                  ctx.db
                    .selectFrom(table)
                    .selectAll()
                    .where((eb) =>
                      eb.or([
                        eb('target_date', '=', targetYmd),
                        eb('target_date', '=', monthlyYmd),
                      ]),
                    )
                    .execute(),
                ),
              ),
            deleteByMilestoneIdAndTargetDate: (
              milestoneId: string,
              targetYmd: string,
            ) =>
              fromPromise(
                DBError,
                `fail to delete ${table} by milestone_id and target_date`,
              )(async () =>
                makeCustomDelete(
                  db,
                  table,
                  schemas,
                )((ctx) =>
                  ctx.db
                    .deleteFrom(table)
                    .where('milestone_id', '=', milestoneId)
                    .where('target_date', '=', targetYmd)
                    .execute(),
                ),
              ),
          };
        },
      ),
    } as const;
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}

assertDefinitionKeysExistInTable<keyof DB['gyomu_apps_info_cdtbl'] & string>()(
  appInfoDefinition,
);

assertDefinitionKeysExistInTable<keyof DB['gyomu_market_holiday'] & string>()(
  marketHolidayDefinition,
);

assertDefinitionKeysExistInTable<keyof DB['gyomu_milestone_cdtbl'] & string>()(
  milestoneDefinition,
);

assertDefinitionKeysExistInTable<keyof DB['gyomu_milestone_daily'] & string>()(
  milestoneDailyDefinition,
);

assertDefinitionKeysExistInTable<keyof DB['gyomu_param_master'] & string>()(
  parameterMasterDefinition,
);

assertDefinitionKeysExistInTable<keyof DB['gyomu_service_cdtbl'] & string>()(
  serviceDefinition,
);

assertDefinitionKeysExistInTable<
  keyof DB['gyomu_service_type_cdtbl'] & string
>()(serviceTypeDefinition);

assertDefinitionKeysExistInTable<keyof DB['gyomu_status_handler'] & string>()(
  statusHandlerDefinition,
);
assertDefinitionKeysExistInTable<keyof DB['gyomu_status_info'] & string>()(
  statusInformationDefinition,
);
assertDefinitionKeysExistInTable<
  keyof DB['gyomu_status_type_cdtbl'] & string
>()(statusTypeDefinition);
assertDefinitionKeysExistInTable<keyof DB['gyomu_task_data'] & string>()(
  taskDataDefinition,
);
assertDefinitionKeysExistInTable<keyof DB['gyomu_task_data_log'] & string>()(
  taskDataLogDefinition,
);
