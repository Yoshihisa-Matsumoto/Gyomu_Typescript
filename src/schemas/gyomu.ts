import { db, defineEntityCrudSchemas } from './common.js';

export const appInfoDefinition = {
  fields: {
    description: db.optionalText({ maxLength: 50 }),
    mailFromAddress: db.optionalText({ maxLength: 200 }),
    mailFromName: db.optionalText({ maxLength: 200 }),
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
} as const;
export const AppInfoSchema = defineEntityCrudSchemas(appInfoDefinition);

export const statusTypeDefinition = {
  fields: {
    description: db.optionalText({ maxLength: 15 }),
  },
  tags: { entity: 'StatusType' },
} as const;
export const StatusTypeSchema = defineEntityCrudSchemas(statusTypeDefinition);

export const statusHandlerDefinition = {
  fields: {
    applicationId: db.id,
    region: db.optionalText({ maxLength: 3 }),
    statusTypeId: db.id,
    recipientAddress: db.optionalText({ maxLength: 200 }),
    recipientType: db.optionalText({ maxLength: 3 }),
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
} as const;
export const StatusHandlerSchema = defineEntityCrudSchemas(
  statusHandlerDefinition,
);

export const statusInformationDefinition = {
  fields: {
    applicationId: db.id,
    statusTypeId: db.id,
    errorId: db.int({ max: 6000, min: 1 }),
    instanceId: db.int({ max: 2147483647 }),
    hostName: db.optionalText({ maxLength: 50 }),
    summary: db.optionalText({ maxLength: 400 }),
    description: db.optionalText({ maxLength: 1000 }),
    developerInfo: db.optionalText(),
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
} as const;
export const StatusInformationSchema = defineEntityCrudSchemas(
  statusInformationDefinition,
);

export const marketHolidayDefinition = {
  fields: {
    market: db.text({ maxLength: 10 }),
    year: db.int({ max: 65534 }),
    holiday: db.dateString,
  },
  tags: { entity: 'MarketHoliday' },
} as const;
export const MarketHolidaySchema = defineEntityCrudSchemas(
  marketHolidayDefinition,
);

export const milestoneDefinition = {
  fields: {
    milestoneId: db.text({ maxLength: 200 }),
    description: db.text({ maxLength: 1000 }),
  },
  tags: { entity: 'Milestone' },
  options: {
    keyMapping: {
      milestoneId: 'milestone_id',
    },
  },
} as const;
export const MilestoneSchema = defineEntityCrudSchemas(milestoneDefinition);

export const milestoneDailyDefinition = {
  fields: {
    targetDate: db.dateString,
    milestoneId: db.text({ maxLength: 200 }),
  },
  tags: { entity: 'MilestoneDaily' },
  options: {
    keyMapping: {
      targetDate: 'target_date',
      milestoneId: 'milestone_id',
    },
    includeAudit: true,
  },
} as const;
export const MilestoneDailySchema = defineEntityCrudSchemas(
  milestoneDailyDefinition,
);

export const variableParameterDefinition = {
  fields: {
    variableKey: db.text({ maxLength: 20 }),
    description: db.text({ maxLength: 200 }),
  },
  tags: { entity: 'VariableParameter' },
  options: {
    keyMapping: {
      variableKey: 'variable_key',
    },
  },
} as const;
export const VariableParameterSchema = defineEntityCrudSchemas(
  variableParameterDefinition,
);

export const parameterMasterDefinition = {
  fields: {
    itemKey: db.text({ maxLength: 50 }),
    itemValue: db.text(),
    itemFromDate: db.dateString,
  },
  tags: { entity: 'ParameterMaster' },
  options: {
    keyMapping: {
      itemKey: 'item_key',
      itemValue: 'item_value',
      itemFromDate: 'item_fromdate',
    },
  },
} as const;
export const ParameterMasterSchema = defineEntityCrudSchemas(
  parameterMasterDefinition,
);

export const taskInfoDefinition = {
  fields: {
    applicationId: db.id,
    description: db.text({ maxLength: 100 }),
    language: db.text({ maxLength: 10 }),
    location: db.text(),
    className: db.text({ maxLength: 100 }),
    restartable: db.boolean,
  },
  tags: { entity: 'TaskInfo' },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      className: 'class_name',
    },
  },
} as const;
export const TaskInfoSchema = defineEntityCrudSchemas(taskInfoDefinition);

export const taskInfoAccessListDefitniion = {
  fields: {
    applicationId: db.id,
    taskInformationId: db.id,
    accountName: db.text({ maxLength: 100 }),
    canAccess: db.boolean,
    forbidden: db.boolean,
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
} as const;
export const TaskInfoAccessListSchema = defineEntityCrudSchemas(
  taskInfoAccessListDefitniion,
);

export const taskDataDefinition = {
  fields: {
    applicationId: db.id,
    taskInformationId: db.id,
    parentTaskDataId: db.optionalId,
    parameter: db.optionalText(),
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
} as const;
export const TaskDataSchema = defineEntityCrudSchemas(taskDataDefinition);

export const taskInstanceDefinition = {
  fields: {
    taskDataId: db.id,
    taskStatus: db.text({ maxLength: 10 }),
    isDone: db.boolean,
    statusInformationId: db.optionalId,
    parameter: db.optionalText(),
    comment: db.optionalText(),
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
} as const;
export const TaskInstanceSchema = defineEntityCrudSchemas(
  taskInstanceDefinition,
);

export const taskInstanceSubmitInformationDefinition = {
  fields: {
    taskInstanceId: db.id,
    submitTo: db.optionalText({ maxLength: 30 }),
  },
  tags: { entity: 'TaskInstanceSubmitInformation' },
} as const;
export const TaskInstanceSubmitInformationSchema = defineEntityCrudSchemas(
  taskInstanceSubmitInformationDefinition,
);

export const taskDataStatusDefinition = {
  fields: {
    taskDataId: db.id,
    taskStatus: db.text({ maxLength: 10 }),
    latestTaskInstanceId: db.id,
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
} as const;
export const TaskDataStatus = defineEntityCrudSchemas(taskDataStatusDefinition);

export const taskDataLogDefinition = {
  fields: {
    taskDataId: db.id,
    log: db.text(),
  },
  tags: { entity: 'TaskDataLog' },
  options: {
    includeAudit: true,
    keyMapping: {
      taskDataId: 'task_data_id',
    },
  },
} as const;
export const TaskDataLogSchema = defineEntityCrudSchemas(taskDataLogDefinition);

export const serviceTypeDefinition = {
  fields: {
    description: db.text({ maxLength: 100 }),
    assemblyName: db.optionalText({ maxLength: 100 }),
    className: db.optionalText({ maxLength: 100 }),
  },
  tags: { entity: 'ServiceType' },
  options: {
    keyMapping: {
      assemblyName: 'assembly_name',
      className: 'class_name',
    },
  },
} as const;
export const ServiceTypeSchema = defineEntityCrudSchemas(serviceTypeDefinition);

export const serviceDefinition = {
  fields: {
    description: db.text({ maxLength: 100 }),
    serviceTypeId: db.id,
    parameter: db.optionalText(),
  },
  tags: { entity: 'Service' },
  options: {
    keyMapping: {
      serviceTypeId: 'service_type_id',
    },
  },
} as const;
export const ServiceSchema = defineEntityCrudSchemas(serviceDefinition);

export const taskSchedulerConfigDefinition = {
  fields: {
    serviceId: db.id,
    description: db.text({ maxLength: 200 }),
    applicationId: db.id,
    taskInformationId: db.id,
    monitorParameter: db.text(),
    nextTriggerTime: db.timestampString,
    taskParameter: db.optionalText(),
    isEnabled: db.boolean,
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
} as const;
export const TaskSchedulerConfigSchema = defineEntityCrudSchemas(
  taskSchedulerConfigDefinition,
);
