import { Schema } from 'effect';
import { defineEntityCrudSchemas } from '../shared/entity/defineEntityCrudSchemas.js';
import {
  appInfoDefinition,
  statusTypeDefinition,
  statusHandlerDefinition,
  statusInformationDefinition,
  marketHolidayDefinition,
  milestoneDefinition,
  milestoneDailyDefinition,
  variableParameterDefinition,
  parameterMasterDefinition,
  taskInfoDefinition,
  taskInfoAccessListDefitniion,
  taskDataDefinition,
  taskInstanceDefinition,
  taskInstanceSubmitInformationDefinition,
  taskDataStatusDefinition,
  taskDataLogDefinition,
  serviceTypeDefinition,
  serviceDefinition,
  taskSchedulerConfigDefinition,
} from '../shared/entity/gyomuDefinition.js';

export const AppInfoSchema = defineEntityCrudSchemas(appInfoDefinition);

export const StatusTypeSchema = defineEntityCrudSchemas(statusTypeDefinition);

export const StatusHandlerSchema = defineEntityCrudSchemas(
  statusHandlerDefinition,
);

export const StatusInformationSchema = defineEntityCrudSchemas(
  statusInformationDefinition,
);

export const MarketHolidaySchema = defineEntityCrudSchemas(
  marketHolidayDefinition,
);

export const MilestoneSchema = defineEntityCrudSchemas(milestoneDefinition);

export const MilestoneDailySchema = defineEntityCrudSchemas(
  milestoneDailyDefinition,
);

export const VariableParameterSchema = defineEntityCrudSchemas(
  variableParameterDefinition,
);

export const ParameterMasterSchema = defineEntityCrudSchemas(
  parameterMasterDefinition,
);

export const TaskInfoSchema = defineEntityCrudSchemas(taskInfoDefinition);

export const TaskInfoAccessListSchema = defineEntityCrudSchemas(
  taskInfoAccessListDefitniion,
);

export const TaskDataSchema = defineEntityCrudSchemas(taskDataDefinition);

export const TaskInstanceSchema = defineEntityCrudSchemas(
  taskInstanceDefinition,
);

export const TaskInstanceSubmitInformationSchema = defineEntityCrudSchemas(
  taskInstanceSubmitInformationDefinition,
);

export const TaskDataStatus = defineEntityCrudSchemas(taskDataStatusDefinition);

export const TaskDataLogSchema = defineEntityCrudSchemas(taskDataLogDefinition);

export const ServiceTypeSchema = defineEntityCrudSchemas(serviceTypeDefinition);

export const ServiceSchema = defineEntityCrudSchemas(serviceDefinition);

export const TaskSchedulerConfigSchema = defineEntityCrudSchemas(
  taskSchedulerConfigDefinition,
);
