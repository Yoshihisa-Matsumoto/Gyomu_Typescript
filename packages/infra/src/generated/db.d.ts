/**
 * Represents the gyomu_apps_info_cdtbl table structure.
 */

export interface GyomuAppsInfoCdtbl {
  /**
   * The description of the application.
   */
  description: string

  /**
   * The unique identifier of the application record.
   */
  id: string

  /**
   * The sender email address for system notifications.
   */
  mail_from_address: string | null

  /**
   * The display name for the sender email address.
   */
  mail_from_name: string | null
}

/**
 * Represents the gyomu_market_holiday table structure.
 */
export interface GyomuMarketHoliday {
  /**
   * The holiday description or date identifier.
   */
  holiday: string

  /**
   * The unique identifier of the holiday record.
   */
  id: string

  /**
   * The identifier of the market to which the holiday applies.
   */
  market: string

  /**
   * The year of the holiday.
   */
  year: number
}

/**
 * Represents the gyomu_milestone_cdtbl table structure.
 */
export interface GyomuMilestoneCdtbl {
  /**
   * A description of the milestone.
   */
  description: string

  /**
   * The unique identifier of the milestone record.
   */
  id: string

  /**
   * The external identifier for the milestone.
   */
  milestone_id: string
}

/**
 * Represents the gyomu_milestone_daily table structure.
 */
export interface GyomuMilestoneDaily {
  /**
   * The unique identifier of the daily milestone record.
   */
  id: string

  /**
   * The associated milestone identifier.
   */
  milestone_id: string

  /**
   * The timestamp of the last modification.
   */
  modified_at: Date

  /**
   * The identifier of the user who last modified the record.
   */
  modified_by: string

  /**
   * The target date for the daily milestone.
   */
  target_date: string

  /**
   * The category or type of the target.
   */
  target_type: string

  /**
   * The target year and month for the daily milestone.
   */
  target_ym: string
}

/**
 * Represents the gyomu_param_master table structure.
 */
export interface GyomuParamMaster {
  /**
   * The unique identifier of the parameter record.
   */
  id: string

  /**
   * The effective start date of the parameter value.
   */
  item_fromdate: string | null

  /**
   * The key associated with the parameter.
   */
  item_key: string

  /**
   * The value associated with the parameter key.
   */
  item_value: string
}

/**
 * Represents the gyomu_service_cdtbl table structure.
 */
export interface GyomuServiceCdtbl {
  /**
   * A description of the service.
   */
  description: string

  /**
   * The unique identifier of the service.
   */
  id: string

  /**
   * Optional parameters configuration for the service.
   */
  parameter: string | null

  /**
   * The identifier of the service type.
   */
  service_type_id: string
}

/**
 * Represents the gyomu_service_type_cdtbl table structure.
 */
export interface GyomuServiceTypeCdtbl {
  /**
   * The name of the assembly associated with the service type.
   */
  assembly_name: string | null

  /**
   * The class name associated with the service type.
   */
  class_name: string | null

  /**
   * A description of the service type.
   */
  description: string

  /**
   * The unique identifier of the service type.
   */
  id: string
}

/**
 * Represents the gyomu_status_handler table structure.
 */
export interface GyomuStatusHandler {
  /**
   * The identifier of the application associated with the status handler.
   */
  application_id: string

  /**
   * The unique identifier of the status handler record.
   */
  id: string

  /**
   * The recipient's contact address (e.g., email).
   */
  recipient_address: string | null

  /**
   * The classification of the recipient contact type.
   */
  recipient_type: string | null

  /**
   * The geographic or logic region associated with this handler.
   */
  region: string | null

  /**
   * The identifier of the status type handled.
   */
  status_type_id: string | null
}

/**
 * Represents the gyomu_status_info table structure.
 */
export interface GyomuStatusInfo {
  /**
   * The identifier of the application associated with the status info.
   */
  application_id: string

  /**
   * An optional description of the status info.
   */
  description: string | null

  /**
   * Detailed technical information for debugging and developer reference.
   */
  developer_info: string | null

  /**
   * The error code or identifier associated with the status.
   */
  error_id: number

  /**
   * The host name where the event occurred.
   */
  host_name: string | null

  /**
   * The unique identifier of the status info record.
   */
  id: string

  /**
   * The identifier of the specific system instance.
   */
  instance_id: number

  /**
   * The timestamp of the last modification.
   */
  modified_at: Date

  /**
   * The user identifier responsible for the last modification.
   */
  modified_by: string

  /**
   * The identifier of the status type.
   */
  status_type_id: string

  /**
   * An optional brief summary of the status.
   */
  summary: string | null
}

/**
 * Represents the gyomu_status_type_cdtbl table structure.
 */
export interface GyomuStatusTypeCdtbl {
  /**
   * An optional description of the status type.
   */
  description: string | null

  /**
   * The unique identifier of the status type.
   */
  id: string
}

/**
 * Represents the gyomu_task_data table structure.
 */
export interface GyomuTaskData {
  /**
   * The identifier of the application associated with the task data.
   */
  application_id: string

  /**
   * The unique identifier of the task data record.
   */
  id: string

  /**
   * The timestamp of the last modification.
   */
  modified_at: Date

  /**
   * The user identifier responsible for the last modification.
   */
  modified_by: string

  /**
   * Optional parameters configuration for the task.
   */
  parameter: string | null

  /**
   * The identifier of the parent task data, if applicable.
   */
  parent_task_data_id: string | null

  /**
   * The identifier of the associated task info record.
   */
  task_info_id: string
}

/**
 * Represents the gyomu_task_data_log table structure.
 */
export interface GyomuTaskDataLog {
  /**
   * The unique identifier of the task data log record.
   */
  id: string

  /**
   * The log message content.
   */
  log: string

  /**
   * The timestamp of the log creation or modification.
   */
  modified_at: Date

  /**
   * The user identifier responsible for the log.
   */
  modified_by: string

  /**
   * The identifier of the associated task data.
   */
  task_data_id: string
}

/**
 * Represents the gyomu_task_data_status table structure.
 */
export interface GyomuTaskDataStatus {
  /**
   * The unique identifier of the task status record.
   */
  id: string

  /**
   * The identifier of the latest task instance.
   */
  latest_task_instance_id: string

  /**
   * The timestamp of the last modification.
   */
  modified_at: Date

  /**
   * The user identifier responsible for the modification.
   */
  modified_by: string

  /**
   * The identifier of the associated task data.
   */
  task_data_id: string

  /**
   * The status identifier of the task.
   */
  task_status: string | null
}

/**
 * Represents the gyomu_task_info_access_list table structure.
 */
export interface GyomuTaskInfoAccessList {
  /**
   * The account name authorized to access the task.
   */
  account_name: string

  /**
   * The identifier of the application associated with the access list.
   */
  application_id: string

  /**
   * Indicates if the account is permitted access.
   */
  can_access: boolean

  /**
   * Indicates if the account is explicitly restricted.
   */
  forbidden: boolean

  /**
   * The unique identifier of the access list record.
   */
  id: string

  /**
   * The identifier of the associated task info record.
   */
  task_info_id: string
}

/**
 * Represents the gyomu_task_info_cdtbl table structure.
 */
export interface GyomuTaskInfoCdtbl {
  /**
   * The identifier of the application associated with the task info.
   */
  application_id: string

  /**
   * The class name associated with the task handler.
   */
  class_name: string

  /**
   * A description of the task.
   */
  description: string

  /**
   * The unique identifier of the task info record.
   */
  id: string

  /**
   * The programming language associated with the task implementation.
   */
  language: string

  /**
   * The physical or network location of the task handler.
   */
  location: string

  /**
   * Indicates if the task can be restarted.
   */
  restartable: boolean
}

/**
 * Represents the gyomu_task_instance table structure.
 */
export interface GyomuTaskInstance {
  /**
   * An optional comment for the task instance.
   */
  comment: string | null

  /**
   * The unique identifier of the task instance.
   */
  id: string

  /**
   * Indicates if the task instance is completed.
   */
  is_done: boolean

  /**
   * The timestamp of the last modification.
   */
  modified_at: Date

  /**
   * The user identifier responsible for the modification.
   */
  modified_by: string

  /**
   * Optional parameters configuration for the instance.
   */
  parameter: string | null

  /**
   * The identifier of the status info associated with this instance.
   */
  status_info_id: string | null

  /**
   * The identifier of the associated task data record.
   */
  task_data_id: string

  /**
   * The current status of the task instance.
   */
  task_status: string | null
}

/**
 * Represents the gyomu_task_instance_submit_information table structure.
 */
export interface GyomuTaskInstanceSubmitInformation {
  /**
   * The unique identifier of the submission record.
   */
  id: string

  /**
   * The submission destination address.
   */
  submit_to: string | null

  /**
   * The identifier of the task instance associated with the submission.
   */
  task_instance_id: string
}

/**
 * Represents the gyomu_task_scheduler_config table structure.
 */
export interface GyomuTaskSchedulerConfig {
  /**
   * The identifier of the application associated with the scheduler config.
   */
  application_id: string

  /**
   * A description of the scheduler configuration.
   */
  description: string

  /**
   * The unique identifier of the scheduler configuration record.
   */
  id: string

  /**
   * Indicates if the scheduler configuration is active.
   */
  is_enabled: boolean

  /**
   * Monitoring parameters for the scheduled task.
   */
  monitor_parameter: string

  /**
   * The scheduled time for the next trigger.
   */
  next_trigger_time: Date

  /**
   * The identifier of the service associated with this scheduler config.
   */
  service_id: string

  /**
   * The identifier of the task info record triggered by this config.
   */
  task_info_id: string

  /**
   * The parameter configuration for the task being scheduled.
   */
  task_parameter: string | null
}

/**
 * Represents the gyomu_variable_parameter table structure.
 */
export interface GyomuVariableParameter {
  /**
   * A description of the variable parameter.
   */
  description: string

  /**
   * The unique identifier of the variable parameter.
   */
  id: string

  /**
   * The key associated with the variable parameter.
   */
  variable_key: string
}

/**
 * Represents the database schema definition containing tables for apps, milestones, services, status, tasks, and configuration.
 */
export interface DB {
  /**
   * Definition of the application information table.
   */
  gyomu_apps_info_cdtbl: GyomuAppsInfoCdtbl

  /**
   * Definition of the market holiday table.
   */
  gyomu_market_holiday: GyomuMarketHoliday

  /**
   * Definition of the milestone table.
   */
  gyomu_milestone_cdtbl: GyomuMilestoneCdtbl

  /**
   * Definition of the daily milestone table.
   */
  gyomu_milestone_daily: GyomuMilestoneDaily

  /**
   * Definition of the parameter master table.
   */
  gyomu_param_master: GyomuParamMaster

  /**
   * Definition of the service table.
   */
  gyomu_service_cdtbl: GyomuServiceCdtbl

  /**
   * Definition of the service type table.
   */
  gyomu_service_type_cdtbl: GyomuServiceTypeCdtbl

  /**
   * Definition of the status handler table.
   */
  gyomu_status_handler: GyomuStatusHandler

  /**
   * Definition of the status information table.
   */
  gyomu_status_info: GyomuStatusInfo

  /**
   * Definition of the status type table.
   */
  gyomu_status_type_cdtbl: GyomuStatusTypeCdtbl

  /**
   * Definition of the task data table.
   */
  gyomu_task_data: GyomuTaskData

  /**
   * Definition of the task data log table.
   */
  gyomu_task_data_log: GyomuTaskDataLog

  /**
   * Definition of the task data status table.
   */
  gyomu_task_data_status: GyomuTaskDataStatus

  /**
   * Definition of the task info access list table.
   */
  gyomu_task_info_access_list: GyomuTaskInfoAccessList

  /**
   * Definition of the task info table.
   */
  gyomu_task_info_cdtbl: GyomuTaskInfoCdtbl

  /**
   * Definition of the task instance table.
   */
  gyomu_task_instance: GyomuTaskInstance

  /**
   * Definition of the task instance submit information table.
   */
  gyomu_task_instance_submit_information: GyomuTaskInstanceSubmitInformation

  /**
   * Definition of the task scheduler configuration table.
   */
  gyomu_task_scheduler_config: GyomuTaskSchedulerConfig

  /**
   * Definition of the variable parameter table.
   */
  gyomu_variable_parameter: GyomuVariableParameter
}
