import { db, defineEntityCrudSchemas } from './common.js';

const appInfo = {
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    description: db.optionalText({ maxLength: 50 }),
    mailFromAddress: db.optionalText({ maxLength: 200 }),
    mailFromName: db.optionalText({ maxLength: 200 }),
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      mailFromAddress: 'mail_from_address',
      mailFromName: 'mail_from_name',
    },
  },
} as const;
export const AppInfoSchema = defineEntityCrudSchemas(appInfo);

export const StatusType = defineEntityCrudSchemas({
  fields: {
    statusType: db.int({ max: 6000, min: 1 }),
    description: db.optionalText({ maxLength: 15 }),
  },
  options: {
    keyMapping: {
      statusType: 'status_type',
    },
  },
});

export const StatusHandler = defineEntityCrudSchemas({
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    region: db.optionalText({ maxLength: 3 }),
    statusType: db.int({ max: 6000, min: 1 }),
    recipientAddress: db.optionalText({ maxLength: 200 }),
    recipientType: db.optionalText({ maxLength: 3 }),
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      statusType: 'status_type',
      recipientAddress: 'recipient_address',
      recipientType: 'recipient_type',
    },
  },
});

export const StatusInformation = defineEntityCrudSchemas({
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    statusType: db.int({ max: 6000, min: 1 }),
    errorId: db.int({ max: 6000, min: 1 }),
    instanceId: db.int({ max: 2147483647 }),
    hostName: db.optionalText({ maxLength: 50 }),
    summary: db.optionalText({ maxLength: 400 }),
    description: db.optionalText({ maxLength: 1000 }),
    developerInfo: db.optionalText(),
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      statusType: 'status_type',
      errorId: 'error_id',
      instanceId: 'instance_id',
      developerInfo: 'developer_info',
    },
    includeAudit: true,
  },
});

export const MarketHoliday = defineEntityCrudSchemas({
  fields: {
    market: db.text({ maxLength: 10 }),
    year: db.int({ max: 65534 }),
    holiday: db.dateString,
  },
});

export const Milestone = defineEntityCrudSchemas({
  fields: {
    milestoneId: db.text({ maxLength: 200 }),
    description: db.text({ maxLength: 1000 }),
  },
  options: {
    keyMapping: {
      milestoneId: 'milestone_id',
    },
  },
});

export const MilestoneDaily = defineEntityCrudSchemas({
  fields: {
    targetDate: db.dateString,
    milestoneId: db.text({ maxLength: 200 }),
  },
  options: {
    keyMapping: {
      targetDate: 'target_date',
      milestoneId: 'milestone_id',
    },
    includeAudit: true,
  },
});

export const VariableParameter = defineEntityCrudSchemas({
  fields: {
    variableKey: db.text({ maxLength: 20 }),
    description: db.text({ maxLength: 200 }),
  },
  options: {
    keyMapping: {
      variableKey: 'variable_key',
    },
  },
});

export const ParameterMaster = defineEntityCrudSchemas({
  fields: {
    itemKey: db.text({ maxLength: 50 }),
    itemValue: db.text(),
    itemFromDate: db.dateString,
  },
  options: {
    keyMapping: {
      itemKey: 'item_key',
      itemValue: 'item_value',
      itemFromDate: 'item_fromdate',
    },
  },
});

export const TaskInfo = defineEntityCrudSchemas({
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    taskInformationId: db.int({ max: 6000, min: 1 }),
    description: db.text({ maxLength: 100 }),
    language: db.text({ maxLength: 10 }),
    location: db.text(),
    className: db.text({ maxLength: 100 }),
    restartable: db.boolean,
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      className: 'class_name',
    },
  },
});

export const TaskInfoAccessList = defineEntityCrudSchemas({
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    taskInformationId: db.int({ max: 6000, min: 1 }),
    accountName: db.text({ maxLength: 100 }),
    canAccess: db.boolean,
    forbidden: db.boolean,
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      accountName: 'account_name',
      canAccess: 'can_access',
    },
  },
});

export const TaskData = defineEntityCrudSchemas({
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    taskInformationId: db.int({ max: 6000, min: 1 }),
    parentTaskDataId: db.optionalId,
    parameter: db.optionalText(),
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      taskInformationId: 'task_info_id',
      parentTaskDataId: 'parent_task_data_id',
    },
    includeAudit: true,
  },
});

export const TaskInstance = defineEntityCrudSchemas({
  fields: {
    taskDataId: db.id,
    taskStatus: db.text({ maxLength: 10 }),
    isDone: db.boolean,
    statusInformationId: db.optionalId,
    parameter: db.optionalText(),
    comment: db.optionalText(),
  },
  options: {
    keyMapping: {
      taskDataId: 'task_data_id',
      taskStatus: 'task_status',
      isDone: 'is_done',
      statusInformationId: 'status_info_id',
    },
    includeAudit: true,
  },
});

export const TaskInstanceSubmitInformation = defineEntityCrudSchemas({
  fields: {
    taskInstanceId: db.id,
    submitTo: db.optionalText({ maxLength: 30 }),
  },
});

export const TaskDataStatus = defineEntityCrudSchemas({
  fields: {
    taskDataId: db.id,
    taskStatus: db.text({ maxLength: 10 }),
    latestTaskInstanceId: db.id,
  },
  options: {
    includeAudit: true,
    keyMapping: {
      taskDataId: 'task_data_id',
      taskStatus: 'task_status',
      latestTaskInstanceId: 'latest_task_instance_id',
    },
  },
});

export const TaskDataLog = defineEntityCrudSchemas({
  fields: {
    taskDataId: db.id,
    log: db.text(),
  },
  options: {
    includeAudit: true,
    keyMapping: {
      taskDataId: 'task_data_id',
    },
  },
});

export const ServiceType = defineEntityCrudSchemas({
  fields: {
    serviceTypeId: db.int({ max: 6000, min: 1 }),
    description: db.text({ maxLength: 100 }),
    assemblyName: db.optionalText({ maxLength: 100 }),
    className: db.optionalText({ maxLength: 100 }),
  },
  options: {
    keyMapping: {
      serviceTypeId: 'service_type_id',
      assemblyName: 'assembly_name',
      className: 'class_name',
    },
  },
});

export const Service = defineEntityCrudSchemas({
  fields: {
    serviceId: db.int({ max: 6000, min: 1 }),
    description: db.text({ maxLength: 100 }),
    serviceTypeId: db.int({ max: 6000, min: 1 }),
    parameter: db.optionalText(),
  },
  options: {
    keyMapping: {
      serviceId: 'service_id',
      serviceTypeId: 'service_type_id',
    },
  },
});

export const TaskSchedulerConfig = defineEntityCrudSchemas({
  fields: {
    serviceId: db.int({ max: 6000, min: 1 }),
    description: db.text({ maxLength: 200 }),
    applicationId: db.int({ max: 6000, min: 1 }),
    taskInformationId: db.int({ max: 6000, min: 1 }),
    monitorParameter: db.text(),
    nextTriggerTime: db.timestampString,
    taskParameter: db.optionalText(),
    isEnabled: db.boolean,
  },
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
});
