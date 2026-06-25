import { defineEntityCrudSchemas } from '../entity/defineEntityCrudSchemas.js'
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
  taskDataStatusDefinition,
  taskInfoAccessListDefitniion,
  taskInfoDefinition,
  taskInstanceDefinition,
  taskInstanceSubmitInformationDefinition,
  taskSchedulerConfigDefinition,
  variableParameterDefinition,
} from '../entity/gyomuDefinition.js'

/**
 * Defines the CRUD schemas for AppInfo.
 */
export const AppInfoSchema = defineEntityCrudSchemas(appInfoDefinition)

/**
 * Defines the CRUD schemas for StatusType.
 */
export const StatusTypeSchema = defineEntityCrudSchemas(statusTypeDefinition)

/**
 * Defines the CRUD schemas for StatusHandler.
 */
export const StatusHandlerSchema = defineEntityCrudSchemas(statusHandlerDefinition)

/**
 * Defines the CRUD schemas for StatusInformation.
 */
export const StatusInformationSchema = defineEntityCrudSchemas(statusInformationDefinition)

/**
 * Defines the CRUD schemas for MarketHoliday.
 */
export const MarketHolidaySchema = defineEntityCrudSchemas(marketHolidayDefinition)

/**
 * Defines the CRUD schemas for Milestone.
 */
export const MilestoneSchema = defineEntityCrudSchemas(milestoneDefinition)

/**
 * Defines the CRUD schemas for MilestoneDaily.
 */
export const MilestoneDailySchema = defineEntityCrudSchemas(milestoneDailyDefinition)

/**
 * Defines the CRUD schemas for VariableParameter.
 */
export const VariableParameterSchema = defineEntityCrudSchemas(variableParameterDefinition)

/**
 * Defines the CRUD schemas for ParameterMaster.
 */
export const ParameterMasterSchema = defineEntityCrudSchemas(parameterMasterDefinition)

/**
 * Defines the CRUD schemas for TaskInfo.
 */
export const TaskInfoSchema = defineEntityCrudSchemas(taskInfoDefinition)

/**
 * Defines the CRUD schemas for TaskInfoAccessList.
 */
export const TaskInfoAccessListSchema = defineEntityCrudSchemas(taskInfoAccessListDefitniion)

/**
 * Defines the CRUD schemas for TaskData.
 */
export const TaskDataSchema = defineEntityCrudSchemas(taskDataDefinition)

/**
 * Defines the CRUD schemas for TaskInstance.
 */
export const TaskInstanceSchema = defineEntityCrudSchemas(taskInstanceDefinition)

/**
 * Defines the CRUD schemas for TaskInstanceSubmitInformation.
 */
export const TaskInstanceSubmitInformationSchema = defineEntityCrudSchemas(
  taskInstanceSubmitInformationDefinition,
)

/**
 * Defines the CRUD schemas for TaskDataStatus.
 */
export const TaskDataStatus = defineEntityCrudSchemas(taskDataStatusDefinition)

/**
 * Defines the CRUD schemas for TaskDataLog.
 */
export const TaskDataLogSchema = defineEntityCrudSchemas(taskDataLogDefinition)

/**
 * Defines the CRUD schemas for ServiceType.
 */
export const ServiceTypeSchema = defineEntityCrudSchemas(serviceTypeDefinition)

/**
 * Defines the CRUD schemas for Service.
 */
export const ServiceSchema = defineEntityCrudSchemas(serviceDefinition)

/**
 * Defines the CRUD schemas for TaskSchedulerConfig.
 */
export const TaskSchedulerConfigSchema = defineEntityCrudSchemas(taskSchedulerConfigDefinition)
