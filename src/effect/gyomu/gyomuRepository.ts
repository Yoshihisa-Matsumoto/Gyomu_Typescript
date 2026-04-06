import { Effect, Layer, ServiceMap } from 'effect';
import {
  assertDefinitionKeysExistInTable,
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  CrudRepositoryFromSchemasWithFindByColumn,
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
import { convertToSchemaObjectWithEffect } from '../schemas/common.js';

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
      exists: (
        milestoneId: string,
        targetDate: string,
      ) => Effect.Effect<
        { exists: true; updateTime: string } | { exists: false },
        DBError
      >;
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
            exists: (milestoneId: string, targetDate: string) =>
              fromPromise(
                DBError,
                `fail to find ${table} by milestone_id and target_date`,
              )(async () => {
                const record = await db
                  .selectFrom(table)
                  .selectAll()
                  .where('milestone_id', '=', milestoneId)
                  .where('target_date', '=', targetDate)
                  .executeTakeFirst();
                return record;
              }).pipe(
                Effect.flatMap((record) => {
                  if (!record) return Effect.succeed({ exists: false });

                  return convertToSchemaObjectWithEffect(
                    DBError,
                    `${schemas.tags.entity}`,
                  )(schemas.selectSchema, record).pipe(
                    Effect.map((data) => {
                      return {
                        exists: true,
                        updateTime: data.modifiedAt,
                      };
                    }),
                  );
                }),
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
