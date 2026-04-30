import { ParameterService } from '@gyomu/core/shared/parameter';

import { DBError } from '@gyomu/core';
import { beforeEach, expect, it, test } from 'vitest';
import { GyomuRepository } from '@gyomu/core/gyomu';
import { Effect, Layer } from 'effect';
import { ParameterMasterSchema } from '@gyomu/core/schemas/gyomu';
import { makeRunner } from '@gyomu/core/shared/effect';
import { describe } from 'node:test';
import { LocalDate, parseYmdToDate } from '@gyomu/shared/entity';
import { initLoggerFromEnv } from '../logger/pinoLogger.js';
import { ParameterServiceLayer } from '../shared/parameter/ParameterServiceLayer.js';

await initLoggerFromEnv();
const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';

beforeEach(() => {});
test('parameter parse', async () => {
  await setValueTest('test Data');
  await setValueTest(true);
  await setValueTest(12345);
});

test('db error test', async () => {
  const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () =>
        Effect.fail(
          new DBError({
            message: 'DB connection error',
            cause: undefined,
            operation: 'select',
            table: 'parameterMaster',
          }),
        ),
    },
  } as any);
  const TestLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  const testRunner = makeRunner(TestLayer);
  const program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.setValue('abc', 'abc');
  });
  expect(async () => await testRunner(program)).rejects.toThrow(
    'DB connection error',
  );
});
test('no parameter found', async () => {
  const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([]),
    },
  } as any);
  const TestLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  const testRunner = makeRunner(TestLayer);
  const itemKey = 'abc';
  const program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.getValue(itemKey);
  });
  expect(async () => await testRunner(program)).rejects.toThrow(
    `Can not retrieve parameter value for key`,
  );
});
test('invalid number returns NaN', async () => {
  const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () =>
        Effect.succeed([
          {
            id: testId,
            itemKey: 'abc',
            itemValue: 'not a number',
            itemFromDate: '',
          },
        ]),
    },
  } as any);
  const TestLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  const testRunner = makeRunner(TestLayer);
  const program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.numberValue('abc');
  });
  const result = await testRunner(program);
  expect(result).toBeNaN();
});
test('boolean is case insensitive', async () => {
  const GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () =>
        Effect.succeed([
          {
            id: testId,
            itemKey: 'abc',
            itemValue: 'TrUE',
            itemFromDate: '',
          },
        ]),
    },
  } as any);
  const TestLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  const testRunner = makeRunner(TestLayer);
  const program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.booleanValue('abc');
  });
  const result = await testRunner(program);
  expect(result).toBe(true);
});
describe('multiple parameter with different value test', () => {
  const itemKey = 'ITEM_KEY_Test$$';
  const records: (typeof ParameterMasterSchema.types._select)[] = [
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'oldest',
      itemFromDate: null,
    },
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'current',
      itemFromDate: LocalDate.make('2021-01-01'),
    },
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'old',
      itemFromDate: LocalDate.make('1984-10-01'),
    },
  ];
  const GyomuRepositoryRetrieveMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed(records),
    },
  } as any);
  const TestRetrieveLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryRetrieveMock),
  );
  const testRetrieveRunner = makeRunner(TestRetrieveLayer);
  const programValue = (targetYmd: string) =>
    Effect.gen(function* () {
      const parameter = yield* ParameterService;
      return yield* parameter.getValue(
        itemKey,
        undefined,
        parseYmdToDate(targetYmd),
      );
    });
  it('get oldest value', async () => {
    const resultValue = await testRetrieveRunner(programValue('1980-04-01'));
    expect(resultValue).toEqual('oldest');
  });
  it('get mid range value', async () => {
    const resultValue = await testRetrieveRunner(programValue('1985-04-01'));
    expect(resultValue).toEqual('old');
  });
  it('get current value by future date', async () => {
    const resultValue = await testRetrieveRunner(programValue('2022-04-01'));
    expect(resultValue).toEqual('current');
  });
  it('get current value by exact date', async () => {
    const resultValue = await testRetrieveRunner(programValue('2021-01-01'));
    expect(resultValue).toEqual('current');
  });
});
test('no defaultRow test', async () => {
  const itemKey = 'ITEM_KEY_Test$$';
  const records: (typeof ParameterMasterSchema.types._select)[] = [
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'current',
      itemFromDate: LocalDate.make('2021-01-01'),
    },
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'old',
      itemFromDate: LocalDate.make('1984-10-01'),
    },
  ];
  const GyomuRepositoryRetrieveMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed(records),
    },
  } as any);
  const TestRetrieveLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryRetrieveMock),
  );
  const testRetrieveRunner = makeRunner(TestRetrieveLayer);
  const programValue = (targetYmd: string) =>
    Effect.gen(function* () {
      const parameter = yield* ParameterService;
      return yield* parameter.getValue(
        itemKey,
        undefined,
        parseYmdToDate(targetYmd),
      );
    });
  await expect(
    testRetrieveRunner(programValue('1980-04-01')),
  ).rejects.toMatchObject({
    _tag: 'ValueError',
    message: 'No default value found',
  });
});
test('multiple defaultRows test', async () => {
  const itemKey = 'ITEM_KEY_Test$$';
  const records: (typeof ParameterMasterSchema.types._select)[] = [
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'current',
      itemFromDate: null,
    },
    {
      id: testId,
      itemKey: itemKey,
      itemValue: 'old',
      itemFromDate: null,
    },
  ];
  const GyomuRepositoryRetrieveMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed(records),
    },
  } as any);
  const TestRetrieveLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryRetrieveMock),
  );
  const testRetrieveRunner = makeRunner(TestRetrieveLayer);
  const programValue = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.getValue(itemKey);
  });
  await expect(testRetrieveRunner(programValue)).rejects.toMatchObject({
    _tag: 'ValueError',
    message:
      'Multiple default values found. Please ensure there is only one default value without itemFromDate.',
  });
});
async function setValueTest<T extends string | boolean | number>(itemValue: T) {
  const itemKey = 'ITEM_KEY_Test$$';
  const recordCreate: typeof ParameterMasterSchema.types._insert = {
    itemKey: itemKey,
    itemValue: itemValue.toString(),
    itemFromDate: null,
  };
  const recordSelect: typeof ParameterMasterSchema.types._select = {
    ...recordCreate,
    id: testId,
  };
  let GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([]),
      create: () => Effect.succeed([recordCreate]),
    },
  } as any);
  let TestLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryMock),
  );
  let testRunner = makeRunner(TestLayer);
  let program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.setValue(itemKey, itemValue);
  });
  await testRunner(program);

  let GyomuRepositoryRetrieveMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([recordSelect]),
    },
  } as any);
  let TestRetrieveLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryRetrieveMock),
  );
  let testRetrieveRunner = makeRunner(TestRetrieveLayer);
  const programValue = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    if (typeof itemValue === 'string') {
      return yield* parameter.getValue(itemKey);
    } else if (typeof itemValue === 'boolean') {
      return yield* parameter.booleanValue(itemKey);
    } else if (typeof itemValue === 'number') {
      return yield* parameter.numberValue(itemKey);
    } else {
      return yield* Effect.fail(
        new DBError({ message: 'Invalid type', cause: undefined }),
      );
    }
  });
  let resultValue = await testRetrieveRunner(programValue);
  expect(resultValue).toEqual(itemValue);

  GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([recordSelect]),
      updateValueByItemKey: () => Effect.succeed(true),
      create: () =>
        Effect.fail(
          new DBError({
            message: 'Create should not be called when record exists',
            cause: undefined,
          }),
        ),
    },
  } as any);
  TestLayer = ParameterServiceLayer.pipe(Layer.provide(GyomuRepositoryMock));
  testRunner = makeRunner(TestLayer);
  program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.setValue(itemKey, itemValue);
  });
  await testRunner(program);

  resultValue = await testRetrieveRunner(programValue);
  expect(resultValue).toEqual(itemValue);

  GyomuRepositoryMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([recordSelect]),
      deleteByItemKey: () => Effect.succeed(true),
      updateValueByItemKey: () =>
        Effect.fail(
          new DBError({
            message: 'Update should not be called when record is deleted',
            cause: undefined,
          }),
        ),
      create: () =>
        Effect.fail(
          new DBError({
            message: 'Create should not be called when record exists',
            cause: undefined,
          }),
        ),
    },
  } as any);
  TestLayer = ParameterServiceLayer.pipe(Layer.provide(GyomuRepositoryMock));
  testRunner = makeRunner(TestLayer);
  program = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.setValue(itemKey, '');
  });
  await testRunner(program);

  GyomuRepositoryRetrieveMock = Layer.succeed(GyomuRepository, {
    parameterMaster: {
      findByItemKey: () => Effect.succeed([]),
    },
  } as any);
  TestRetrieveLayer = ParameterServiceLayer.pipe(
    Layer.provide(GyomuRepositoryRetrieveMock),
  );
  testRetrieveRunner = makeRunner(TestRetrieveLayer);
  const programExists = Effect.gen(function* () {
    const parameter = yield* ParameterService;
    return yield* parameter.keyExists(itemKey);
  });
  const resultExists = await testRetrieveRunner(programExists);
  expect(resultExists).toBeFalsy();
}
