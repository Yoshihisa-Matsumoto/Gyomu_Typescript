import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import {
  AppInfoSchema,
  StatusTypeSchema,
  StatusHandlerSchema,
  StatusInformationSchema,
  MarketHolidaySchema,
  MilestoneSchema,
  MilestoneDailySchema,
  VariableParameterSchema,
  ParameterMasterSchema,
  TaskInfoSchema,
  TaskInfoAccessListSchema,
  TaskDataSchema,
  TaskInstanceSchema,
  TaskInstanceSubmitInformationSchema,
  TaskDataStatus,
  TaskDataLogSchema,
  ServiceTypeSchema,
  ServiceSchema,
} from '../gyomu.js';

const testId = 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b';

const assertValidDefinition = (schema: any, input: any) => {
  const encoded = Schema.encodeSync(schema.selectSchema)(input);
  const decoded = Schema.decodeSync(schema.selectSchema)(encoded);
  expect(decoded).toEqual(input);
};

describe('All Schema Definitions', () => {
  it('AppInfo is consistent', () => {
    assertValidDefinition(AppInfoSchema, {
      id: testId,
      description: 'aabc',
      mailFromAddress: null,
      mailFromName: null,
    });
  });
  it('StatusType', () => {
    assertValidDefinition(StatusTypeSchema, {
      id: testId,
      description: null,
    });
  });

  it('StatusHandler', () => {
    assertValidDefinition(StatusHandlerSchema, {
      id: testId,
      applicationId: testId,
      region: null,
      statusTypeId: testId,
      recipientAddress: null,
      recipientType: null,
    });
  });

  it('StatusInformation', () => {
    assertValidDefinition(StatusInformationSchema, {
      id: testId,
      applicationId: testId,
      statusTypeId: testId,
      errorId: 1,
      instanceId: 1,
      hostName: null,
      summary: null,
      description: null,
      developerInfo: null,
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('MarketHoliday', () => {
    assertValidDefinition(MarketHolidaySchema, {
      id: testId,
      market: 'JP',
      year: 2024,
      holiday: '2024-01-01',
    });
  });

  it('Milestone', () => {
    assertValidDefinition(MilestoneSchema, {
      id: testId,
      milestoneId: 'M1',
      description: 'desc',
    });
  });

  it('MilestoneDaily', () => {
    assertValidDefinition(MilestoneDailySchema, {
      id: testId,
      targetType: 'daily',
      targetYm: '2024-01',
      targetDate: '2024-01-01',
      milestoneId: 'M1',
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('VariableParameter', () => {
    assertValidDefinition(VariableParameterSchema, {
      id: testId,
      variableKey: 'key',
      description: 'desc',
    });
  });

  it('ParameterMaster', () => {
    assertValidDefinition(ParameterMasterSchema, {
      id: testId,
      itemKey: 'k',
      itemValue: 'v',
      itemFromDate: '2024-01-01',
    });
  });

  it('TaskInfo', () => {
    assertValidDefinition(TaskInfoSchema, {
      id: testId,
      applicationId: testId,
      description: 'desc',
      language: 'ja',
      location: 'loc',
      className: 'cls',
      restartable: true,
    });
  });

  it('TaskInfoAccessList', () => {
    assertValidDefinition(TaskInfoAccessListSchema, {
      id: testId,
      applicationId: testId,
      taskInformationId: testId,
      accountName: 'acc',
      canAccess: true,
      forbidden: false,
    });
  });

  it('TaskData', () => {
    assertValidDefinition(TaskDataSchema, {
      id: testId,
      applicationId: testId,
      taskInformationId: testId,
      parentTaskDataId: null,
      parameter: null,
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('TaskInstance', () => {
    assertValidDefinition(TaskInstanceSchema, {
      id: testId,
      taskDataId: testId,
      taskStatus: 'RUNNING',
      isDone: false,
      statusInformationId: null,
      parameter: null,
      comment: null,
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('TaskInstanceSubmitInformation', () => {
    assertValidDefinition(TaskInstanceSubmitInformationSchema, {
      id: testId,
      taskInstanceId: testId,
      submitTo: null,
    });
  });

  it('TaskDataStatus', () => {
    assertValidDefinition(TaskDataStatus, {
      id: testId,
      taskDataId: testId,
      taskStatus: 'OK',
      latestTaskInstanceId: testId,
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('TaskDataLog', () => {
    assertValidDefinition(TaskDataLogSchema, {
      id: testId,
      taskDataId: testId,
      log: 'log',
      modifiedAt: '2026-10-28T00:00:00.000Z',
      modifiedBy: 'test',
    });
  });

  it('ServiceType', () => {
    assertValidDefinition(ServiceTypeSchema, {
      id: testId,
      description: 'desc',
      assemblyName: null,
      className: null,
    });
  });

  it('Service', () => {
    assertValidDefinition(ServiceSchema, {
      id: testId,
      description: 'desc',
      serviceTypeId: testId,
      parameter: null,
    });
  });
});
