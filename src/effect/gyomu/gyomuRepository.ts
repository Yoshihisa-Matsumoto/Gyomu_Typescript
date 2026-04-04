import { Effect, Layer, ServiceMap } from 'effect';
import {
  assertDefinitionKeysExistInTable,
  CrudRepositoryFromSchemasWithFindAll,
  CrudRepositoryFromSchemasWithFindAllAndFindByColumn,
  makeRepositoryFromDb,
} from '../infrastructure/db/common.js';
import {
  appInfoDefinition,
  AppInfoSchema,
  marketHolidayDefinition,
  milestoneDailyDefinition,
  milestoneDefinition,
  parameterMasterDefinition,
  serviceDefinition,
  serviceTypeDefinition,
  statusHandlerDefinition,
  StatusHandlerSchema,
  statusInformationDefinition,
  statusTypeDefinition,
  StatusTypeSchema,
  taskDataDefinition,
  taskDataLogDefinition,
} from '../schemas/gyomu.js';
import { KyselyService } from '../infrastructure/db/kysely-service.js';
import { DB } from '../../db/db.js';

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
