import { Layer } from 'effect';
import { afterAll, test, expect } from 'vitest';
import { ConfigLayer } from '../config.js';
import { KyselyService } from '../db/KyselyService.js';
import { MssqlService } from '../db/MssqlService.js';
import { GyomuRepositoryLayer } from '../gyomu/GyomuRepositoryLayer.js';
import { MainLayer, PlatformLayer } from '../layer.js';
import { syncHoliday } from '@gyomu/core/usecase/syncHolidayService';
import { makeRunner } from '../../../core/dist/effect/index.js';
import { JPXHolidayFetcherLayer } from '../holiday/index.js';

afterAll(() => {
  // @ts-ignore
  const handles = process._getActiveHandles?.() ?? [];
  console.log('HANDLES:', handles);
});
const TestLayer = Layer.mergeAll(
  MainLayer,
  ConfigLayer,
  GyomuRepositoryLayer,
  JPXHolidayFetcherLayer,
)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer));
const testRunner = makeRunner(TestLayer);

test('syncHoliday (Integration)', async () => {
  const result = await testRunner(syncHoliday('JP'));
  console.log(JSON.stringify(result));
  expect(result).toBeDefined();
});
