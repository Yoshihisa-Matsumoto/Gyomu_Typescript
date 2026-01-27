import { prismaMock } from './baseDBClass';
import { ParameterAccess } from '../parameter';
import { gyomu_param_master, Prisma } from '../generated/prisma/client';

import { CriticalError } from '../errors';
import { createDateFromYYYYMMDD } from '../dateOperation';
import { beforeEach, expect, test } from 'vitest';

beforeEach(() => {});
test('parameter parse', async () => {
  await setValueTest('test Data');
  await setValueTest(true);
  await setValueTest(12345);
});

test('db error test', async () => {
  const expectedErrors = [
    new Prisma.PrismaClientKnownRequestError('test', {
      code: 'c010',
      clientVersion: '1.2.3',
    }),
    new Prisma.PrismaClientUnknownRequestError('test', {
      clientVersion: '1.2.3',
    }),
    new Prisma.PrismaClientValidationError('test', { clientVersion: '1.2.3' }),
    new Error('test'),
  ];
  expectedErrors.forEach(async (err) => {
    prismaMock.gyomu_param_master.findMany.mockRejectedValue(err);
    const itemKey = 'ITEM_KEY_Test$$';
    const result = await ParameterAccess.keyExists(itemKey);
    if (result.isOk()) {
      expect(result.isOk()).toBeFalsy();
    } else {
      const dbError = result.error;
      expect(dbError.message).toContain('load gyomu_param_master');
      expect(dbError.innerError).not.toBeUndefined();
      const innerError = dbError.innerError as Error;
      expect(innerError).toEqual(err);
    }
  });

  const criticalErrors = [
    new CriticalError('critical'),
    new Prisma.PrismaClientRustPanicError('critical', '1.2.3'),
  ];
  criticalErrors.forEach(async (err) => {
    prismaMock.gyomu_param_master.findMany.mockRejectedValue(err);
    const itemKey = 'ITEM_KEY_Test$$';
    await expect(ParameterAccess.keyExists(itemKey)).rejects.toBeInstanceOf(
      CriticalError
    );
  });
});

test('multiple parameter with different value test', async () => {
  const itemKey = 'ITEM_KEY_Test$$';
  const records: gyomu_param_master[] = [
    {
      item_key: itemKey,
      item_value: 'oldest',
      item_fromdate: '',
    },
    {
      item_key: itemKey,
      item_value: 'old',
      item_fromdate: '19841001',
    },
    {
      item_key: itemKey,
      item_value: 'current',
      item_fromdate: '20210101',
    },
  ];
  prismaMock.gyomu_param_master.findMany.mockResolvedValue(records);
  let result = await ParameterAccess.value(
    itemKey,
    undefined,
    createDateFromYYYYMMDD('19800401')
  );
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).toEqual('oldest');

  result = await ParameterAccess.value(
    itemKey,
    undefined,
    createDateFromYYYYMMDD('19850401')
  );
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).toEqual('old');

  result = await ParameterAccess.value(
    itemKey,
    undefined,
    createDateFromYYYYMMDD('20220401')
  );
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).toEqual('current');

  result = await ParameterAccess.value(
    itemKey,
    undefined,
    createDateFromYYYYMMDD('20210101')
  );
  if (result.isErr()) {
    expect(result.isErr()).toBeFalsy();
    return;
  }
  expect(result.value).toEqual('current');
});

async function setValueTest<T extends string | boolean | number>(itemValue: T) {
  const itemKey = 'ITEM_KEY_Test$$';
  const record: gyomu_param_master = {
    item_key: itemKey,
    item_value: itemValue.toString(),
    item_fromdate: '',
  };

  prismaMock.gyomu_param_master.create.mockResolvedValue(record);
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([]);
  let result = await ParameterAccess.setValue(itemKey, itemValue);
  expect(result.isOk()).toBeTruthy();
  let resultValue: any;
  if (typeof itemValue === 'string') {
    resultValue = await ParameterAccess.value(itemKey);
  } else if (typeof itemValue === 'boolean') {
    resultValue = await ParameterAccess.booleanValue(itemKey);
  } else if (typeof itemValue === 'number') {
    resultValue = await ParameterAccess.numberValue(itemKey);
  }
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([record]);
  prismaMock.gyomu_param_master.update.mockResolvedValue(record);
  result = await ParameterAccess.setValue(itemKey, itemValue);
  if(result.isErr()) {
    console.log(result.error);
  }
  expect(result.isOk()).toBeTruthy();

  if (typeof itemValue === 'string') {
    resultValue = await ParameterAccess.value(itemKey);
  } else if (typeof itemValue === 'boolean') {
    resultValue = await ParameterAccess.booleanValue(itemKey);
  } else if (typeof itemValue === 'number') {
    resultValue = await ParameterAccess.numberValue(itemKey);
  }

  expect(resultValue.isOk()).toBeTruthy();
  if (resultValue.isErr()) expect(resultValue.error).toBeNull();
  else {
    expect(resultValue.value).toEqual(itemValue);
  }

  prismaMock.gyomu_param_master.delete.mockResolvedValue(record);
  result = await ParameterAccess.setValue(itemKey, '');
  expect(result.isOk()).toBeTruthy();
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([]);
  result = await ParameterAccess.keyExists(itemKey);
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) expect(result.value).toBeFalsy();
}
