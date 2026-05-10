import { Schema } from 'effect'
import { TargetDateSchema } from './date.js'
import { schemaField } from './fields.js'
import type { EntityDefinition, Fields } from './type.js'

export const appInfoDefinition = {
  fields: {
    description: schemaField.text({ maxLength: 50 }),
    mailFromAddress: schemaField.optionalText({ maxLength: 200 }),
    mailFromName: schemaField.optionalText({ maxLength: 200 }),
  },
  tags: {
    entity: 'AppInfo',
    sensitiveFields: ['mailFromAddress', 'mailFromName'] as const,
  },

  options: {
    keyMapping: {
      mailFromAddress: 'mail_from_address',
      mailFromName: 'mail_from_name',
    },
  },
} as const satisfies EntityDefinition<Fields, false>
export const statusTypeDefinition = {
  fields: {
    description: schemaField.optionalText({ maxLength: 15 }),
  },
  tags: { entity: 'StatusType' },
} as const satisfies EntityDefinition<Fields, false>
export const statusHandlerDefinition = {
  fields: {
    applicationId: schemaField.id,
    region: schemaField.optionalText({ maxLength: 3 }),
    statusTypeId: schemaField.id,
    recipientAddress: schemaField.optionalText({ maxLength: 200 }),
    recipientType: schemaField.optionalText({ maxLength: 3 }),
  },
  tags: { entity: 'StatusHandler' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      statusTypeId: 'status_type_id',
      recipientAddress: 'recipient_address',
      recipientType: 'recipient_type',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const statusInformationDefinition = {
  fields: {
    applicationId: schemaField.id,
    statusTypeId: schemaField.id,
    errorId: schemaField.int({ max: 6000, min: 1 }),
    instanceId: schemaField.int({ max: 2147483647 }),
    hostName: schemaField.optionalText({ maxLength: 50 }),
    summary: schemaField.optionalText({ maxLength: 400 }),
    description: schemaField.optionalText({ maxLength: 1000 }),
    developerInfo: schemaField.optionalText(),
  },
  tags: { entity: 'StatusInfo' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      statusTypeId: 'status_type_id',
      errorId: 'error_id',
      instanceId: 'instance_id',
      developerInfo: 'developer_info',
      hostName: 'host_name',
    },
    includeAudit: true,
  },
} as const satisfies EntityDefinition<Fields, true>

export const marketHolidayDefinition = {
  fields: {
    market: schemaField.stringEnum({ enumValues: ['JP', 'US'] }),
    year: schemaField.int({ max: 65534 }),
    holiday: schemaField.dateString,
  },
  tags: { entity: 'MarketHoliday' },
  ui: {
    market: {
      enumAttribute: {
        JP: { label: 'Japan', order: 1 },
        US: { label: 'United States', order: 2 },
      },
      widget: 'select',
    },
    year: {
      widget: 'number',
    },
    holiday: {
      widget: 'text',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const milestoneDefinition = {
  fields: {
    milestoneId: schemaField.text({ maxLength: 200 }),
    description: schemaField.text({ maxLength: 1000 }),
  },
  tags: { entity: 'Milestone' },
  options: {
    keyMapping: {
      milestoneId: 'milestone_id',
    },
  },
} as const satisfies EntityDefinition<Fields, false>
export const milestoneDailyDefinition = {
  fields: {
    targetType: schemaField.text({ maxLength: 10 }), // 'daily' | 'monthly'
    targetDate: schemaField.dateString,
    targetYm: schemaField.text({ maxLength: 7 }), // 'YYYY-MM'
    milestoneId: schemaField.text({ maxLength: 200 }),
  },
  tags: { entity: 'MilestoneDaily' },
  options: {
    keyMapping: {
      targetDate: 'target_date',
      milestoneId: 'milestone_id',
      targetType: 'target_type',
      targetYm: 'target_ym',
    },
    includeAudit: true,
  },
} as const satisfies EntityDefinition<Fields, true>

export const MilestoneDailyDomainSchema = Schema.Struct({
  id: schemaField.id,
  modifiedAt: schemaField.timestampString,
  modifiedBy: schemaField.text({ maxLength: 100 }),
  milestoneId: schemaField.text({ maxLength: 200 }),
  target: TargetDateSchema,
})

export const variableParameterDefinition = {
  fields: {
    variableKey: schemaField.text({ maxLength: 20 }),
    description: schemaField.text({ maxLength: 200 }),
  },
  tags: { entity: 'VariableParameter' },
  options: {
    keyMapping: {
      variableKey: 'variable_key',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const parameterMasterDefinition = {
  fields: {
    itemKey: schemaField.text({ maxLength: 50 }),
    itemValue: schemaField.text(),
    itemFromDate: schemaField.optionalDateString,
  },
  tags: { entity: 'ParameterMaster' },
  options: {
    keyMapping: {
      itemKey: 'item_key',
      itemValue: 'item_value',
      itemFromDate: 'item_fromdate',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const taskInfoDefinition = {
  fields: {
    applicationId: schemaField.id,
    description: schemaField.text({ maxLength: 100 }),
    language: schemaField.text({ maxLength: 10 }),
    location: schemaField.text(),
    className: schemaField.text({ maxLength: 100 }),
    restartable: schemaField.boolean,
  },
  tags: { entity: 'TaskInfo' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      className: 'class_name',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const taskInfoAccessListDefitniion = {
  fields: {
    applicationId: schemaField.id,
    taskInformationId: schemaField.id,
    accountName: schemaField.text({ maxLength: 100 }),
    canAccess: schemaField.boolean,
    forbidden: schemaField.boolean,
  },
  tags: { entity: 'TaskInfoAccessList' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      accountName: 'account_name',
      canAccess: 'can_access',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const taskDataDefinition = {
  fields: {
    applicationId: schemaField.id,
    taskInformationId: schemaField.id,
    parentTaskDataId: schemaField.optionalId,
    parameter: schemaField.optionalText(),
  },
  tags: { entity: 'TaskData' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      parentTaskDataId: 'parent_task_data_id',
    },
    includeAudit: true,
  },
} as const satisfies EntityDefinition<Fields, true>

export const taskInstanceDefinition = {
  fields: {
    taskDataId: schemaField.id,
    taskStatus: schemaField.text({ maxLength: 10 }),
    isDone: schemaField.boolean,
    statusInformationId: schemaField.optionalId,
    parameter: schemaField.optionalText(),
    comment: schemaField.optionalText(),
  },
  tags: { entity: 'TaskInstance' },
  options: {
    keyMapping: {
      taskDataId: 'task_data_id',
      taskStatus: 'task_status',
      isDone: 'is_done',
      statusInformationId: 'status_info_id',
    },
    includeAudit: true,
  },
} as const satisfies EntityDefinition<Fields, true>

export const taskInstanceSubmitInformationDefinition = {
  fields: {
    taskInstanceId: schemaField.id,
    submitTo: schemaField.optionalText({ maxLength: 30 }),
  },
  tags: { entity: 'TaskInstanceSubmitInformation' },
} as const satisfies EntityDefinition<Fields, false>

export const taskDataStatusDefinition = {
  fields: {
    taskDataId: schemaField.id,
    taskStatus: schemaField.text({ maxLength: 10 }),
    latestTaskInstanceId: schemaField.id,
  },
  tags: { entity: 'TaskDataStatus' },
  options: {
    includeAudit: true,
    keyMapping: {
      taskDataId: 'task_data_id',
      taskStatus: 'task_status',
      latestTaskInstanceId: 'latest_task_instance_id',
    },
  },
} as const satisfies EntityDefinition<Fields, true>

export const taskDataLogDefinition = {
  fields: {
    taskDataId: schemaField.id,
    log: schemaField.text(),
  },
  tags: { entity: 'TaskDataLog' },
  options: {
    includeAudit: true,
    keyMapping: {
      taskDataId: 'task_data_id',
    },
  },
} as const satisfies EntityDefinition<Fields, true>

export const serviceTypeDefinition = {
  fields: {
    description: schemaField.text({ maxLength: 100 }),
    assemblyName: schemaField.optionalText({ maxLength: 100 }),
    className: schemaField.optionalText({ maxLength: 100 }),
  },
  tags: { entity: 'ServiceType' },
  options: {
    keyMapping: {
      assemblyName: 'assembly_name',
      className: 'class_name',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const serviceDefinition = {
  fields: {
    description: schemaField.text({ maxLength: 100 }),
    serviceTypeId: schemaField.id,
    parameter: schemaField.optionalText(),
  },
  tags: { entity: 'Service' },
  options: {
    keyMapping: {
      serviceTypeId: 'service_type_id',
    },
  },
} as const satisfies EntityDefinition<Fields, false>

export const taskSchedulerConfigDefinition = {
  fields: {
    serviceId: schemaField.id,
    description: schemaField.text({ maxLength: 200 }),
    applicationId: schemaField.id,
    taskInformationId: schemaField.id,
    monitorParameter: schemaField.text(),
    nextTriggerTime: schemaField.timestampString,
    taskParameter: schemaField.optionalText(),
    isEnabled: schemaField.boolean,
  },
  tags: { entity: 'TaskSchedulerConfig' },
  options: {
    keyMapping: {
      serviceId: 'service_id',
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      monitorParameter: 'monitor_parameter',
      nextTriggerTime: 'next_trigger_time',
      taskParameter: 'task_parameter',
      isEnabled: 'is_enabled',
    },
  },
} as const satisfies EntityDefinition<Fields, false>
