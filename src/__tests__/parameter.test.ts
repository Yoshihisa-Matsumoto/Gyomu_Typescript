import { prismaMock } from './baseDBClass';
import { ParameterAccess } from '../parameter';
import { gyomu_param_master } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { CriticalError, DBError } from '../errors';

beforeEach(() => {});
test('parameter parse', async () => {
  await setValueTest('test Data');
  await setValueTest(true);
  await setValueTest(12345);
});

test('db error test', async () => {
  const expectedErrors = [
    new Prisma.PrismaClientKnownRequestError('test', 'c010', '1.2.3'),
    new Prisma.PrismaClientUnknownRequestError('test', '1.2.3'),
    new Prisma.PrismaClientValidationError('test'),
    new Error('test'),
  ];
  expectedErrors.forEach(async (err) => {
    prismaMock.gyomu_param_master.findMany.mockRejectedValue(err);
    let itemKey = 'ITEM_KEY_Test$$';
    let result = await ParameterAccess.keyExists(itemKey);
    if (result.isSuccess()) {
      expect(result.isSuccess()).toBeFalsy();
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
    let itemKey = 'ITEM_KEY_Test$$';
    await expect(ParameterAccess.keyExists(itemKey)).rejects.toBeInstanceOf(
      CriticalError
    );
  });
});

async function setValueTest<T extends string | boolean | number>(itemValue: T) {
  let itemKey = 'ITEM_KEY_Test$$';
  let record: gyomu_param_master = {
    item_key: itemKey,
    item_value: itemValue.toString(),
    item_fromdate: '',
  };

  prismaMock.gyomu_param_master.create.mockResolvedValue(record);
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([]);
  let result = await ParameterAccess.setValue(itemKey, itemValue);
  expect(result.isSuccess()).toBeTruthy();
  let resultValue: any;
  if (typeof itemValue === 'string') {
    resultValue = await ParameterAccess.value(itemKey);
  } else if (typeof itemValue === 'boolean') {
    resultValue = await ParameterAccess.booleanValue(itemKey);
  } else if (typeof itemValue === 'number') {
    resultValue = await ParameterAccess.numberValue(itemKey);
  }
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([record]);
  result = await ParameterAccess.setValue(itemKey, itemValue);
  expect(result.isSuccess()).toBeTruthy();

  if (typeof itemValue === 'string') {
    resultValue = await ParameterAccess.value(itemKey);
  } else if (typeof itemValue === 'boolean') {
    resultValue = await ParameterAccess.booleanValue(itemKey);
  } else if (typeof itemValue === 'number') {
    resultValue = await ParameterAccess.numberValue(itemKey);
  }

  expect(resultValue.isSuccess()).toBeTruthy();
  if (resultValue.isFailure()) expect(resultValue.error).toBeNull();
  else {
    expect(resultValue.value).toEqual(itemValue);
  }

  prismaMock.gyomu_param_master.delete.mockResolvedValue(record);
  result = await ParameterAccess.setValue(itemKey, '');
  expect(result.isSuccess()).toBeTruthy();
  prismaMock.gyomu_param_master.findMany.mockResolvedValue([]);
  result = await ParameterAccess.keyExists(itemKey);
  expect(result.isSuccess()).toBeTruthy();
  if (result.isSuccess()) expect(result.value).toBeFalsy();
}
