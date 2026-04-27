import { Effect, Layer, ServiceMap } from 'effect';
import {
  assertDefinitionKeysExistInTable,
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  CrudRepositoryFromSchemasWithFindByColumn,
  makeCustomDelete,
  customSQLAndReturnRecords,
  makeRepositoryFromDb,
  makeCustomUpdate,
} from '../infrastructure/db/common.js';
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
import {
  appInfoDefinition,
  marketHolidayDefinition,
  milestoneDailyDefinition,
  milestoneDefinition,
  parameterMasterDefinition,
  serviceDefinition,
  serviceTypeDefinition,
  statusHandlerDefinition,
  statusInformationDefinition,
  statusTypeDefinition,
  taskDataDefinition,
  taskDataLogDefinition,
} from '@gyomu/shared/entity';
import { KyselyService } from '../infrastructure/db/KyselyService.js';
import { DB } from '../db/db.js';
import { fromPromise } from '@gyomu/shared/effect';
import { DBError } from '../errors.js';
import { LocalDate, YearMonth } from '@gyomu/shared/entity';

export class GyomuRepository extends ServiceMap.Service<
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
      findDistinctMarkets: () => Effect.Effect<string[], DBError>;
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
        DBError
      >;
      findByTargetDateAndMonthlyDate: (
        targetDate: LocalDate,
        monthlyYm: YearMonth,
      ) => Effect.Effect<
        (typeof MilestoneDailySchema.types._select)[],
        DBError
      >;
      deleteByMilestoneIdAndTargetDate: (
        milestoneId: string,
        targetDate: LocalDate,
        isMonthly: boolean,
      ) => Effect.Effect<bigint, DBError>;
    };
    readonly parameterMaster: CrudRepositoryFromSchemasWithFindByColumn<
      typeof ParameterMasterSchema,
      'item_key',
      'findByItemKey'
    > & {
      updateValueByItemKey: (
        itemKey: string,
        newValue: string,
      ) => Effect.Effect<bigint, DBError>;
      deleteByItemKey: (itemKey: string) => Effect.Effect<bigint, DBError>;
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
          findByColumn: {
            columnName: 'description',
            methodName: 'findByDescription',
          },
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
      marketHoliday: makeRepositoryFromDb(
        db,
        {
          table: 'gyomu_market_holiday',
          schemas: MarketHolidaySchema,
          options: {
            findAll: false,
            findByColumn: {
              columnName: 'market',
              methodName: 'findByMarket',
            },
          },
        },
        ({ db, table }) => {
          return {
            findDistinctMarkets: () => {
              return fromPromise(
                DBError,
                `fail to find distinct markets from ${table}`,
              )(async () => {
                const markets = await db
                  .selectFrom(table)
                  .select('market')
                  .distinct()
                  .execute();
                return markets.map((m) => m.market);
              });
            },
          };
        },
      ),
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
              targetDate: LocalDate,
              isMonthly: boolean,
            ) => {
              if (isMonthly) {
                return customSQLAndReturnRecords(
                  db,
                  table,
                  schemas,
                  `fail to find ${table} daily recordby milestone_id and target_ymd`,
                )((ctx) =>
                  ctx.db
                    .selectFrom(table)
                    .selectAll()
                    .where('milestone_id', '=', milestoneId)
                    .where('target_type', '=', 'monthly')
                    .where('target_ym', '=', targetDate.slice(0, 7))
                    .execute(),
                );
              } else {
                return customSQLAndReturnRecords(
                  db,
                  table,
                  schemas,
                  `fail to find ${table} by milestone_id and target_date`,
                )((ctx) =>
                  ctx.db
                    .selectFrom(table)
                    .selectAll()
                    .where('milestone_id', '=', milestoneId)
                    .where('target_type', '=', 'daily')
                    .where('target_date', '=', targetDate)
                    .execute(),
                );
              }
            },

            findByTargetDateAndMonthlyDate: (
              targetYmd: LocalDate,
              monthlyYm: YearMonth,
            ) =>
              customSQLAndReturnRecords(
                db,
                table,
                schemas,
                `fail to find ${table} by date = ${targetYmd} or  ${monthlyYm}`,
              )((ctx) =>
                ctx.db
                  .selectFrom(table)
                  .selectAll()
                  .where((eb) =>
                    eb.or([
                      eb.and([
                        eb('target_type', '=', 'daily'),
                        eb('target_date', '=', targetYmd),
                      ]),
                      eb.and([
                        eb('target_type', '=', 'monthly'),
                        eb('target_ym', '=', monthlyYm),
                      ]),
                    ]),
                  )
                  .execute(),
              ),

            deleteByMilestoneIdAndTargetDate: (
              milestoneId: string,
              targetDate: LocalDate,
              isMonthly: boolean,
            ) => {
              if (!isMonthly) {
                return makeCustomDelete(
                  db,
                  table,
                  schemas,
                )(
                  (ctx) =>
                    ctx.db
                      .deleteFrom(table)
                      .where('milestone_id', '=', milestoneId)
                      .where('target_type', '=', 'daily')
                      .where('target_date', '=', targetDate)
                      .execute(),
                  `fail to delete ${table} by milestone_id and target_date for daily`,
                );
              } else {
                return makeCustomDelete(
                  db,
                  table,
                  schemas,
                )(
                  (ctx) =>
                    ctx.db
                      .deleteFrom(table)
                      .where('milestone_id', '=', milestoneId)
                      .where('target_type', '=', 'monthly')
                      .where('target_ym', '=', targetDate.slice(0, 7))
                      .execute(),
                  `fail to delete ${table} by milestone_id and target_date for monthly`,
                );
              }
            },
          };
        },
      ),
      parameterMaster: makeRepositoryFromDb(
        db,
        {
          table: 'gyomu_param_master',
          schemas: ParameterMasterSchema,
          options: {
            findAll: false,
            findByColumn: {
              columnName: 'item_key',
              methodName: 'findByItemKey',
            },
          },
        },
        ({ db, table, schemas }) => {
          return {
            updateValueByItemKey: (itemKey: string, newValue: string) =>
              makeCustomUpdate(
                db,
                table,
                schemas,
              )(
                (ctx) =>
                  ctx.db
                    .updateTable(table)
                    .set(() => ({
                      item_value: newValue,
                      item_fromdate: '',
                    }))
                    .where('item_key', '=', itemKey)
                    .execute(),
                `fail to update ${table} by item_key and new_value`,
              ),

            deleteByItemKey: (itemKey: string) =>
              makeCustomDelete(
                db,
                table,
                schemas,
              )(
                (ctx) =>
                  ctx.db
                    .deleteFrom(table)
                    .where('item_key', '=', itemKey)
                    .where('item_fromdate', '=', '')
                    .execute(),
                `fail to delete from ${table} by item_key=${itemKey}`,
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
