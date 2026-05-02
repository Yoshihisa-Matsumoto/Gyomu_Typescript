import { Layer } from 'effect';
import { ConfigLayer, PlatformLayer } from '@gyomu/infra';
import { MainLayer } from '@gyomu/infra';
import { KyselyService } from '@gyomu/infra/db';
import { MssqlService } from '@gyomu/infra/db';
import { makeRunner } from '@gyomu/core/shared/effect';
import { syncHoliday } from '@gyomu/core/usecase/syncHolidayService';
import { JPXHolidayFetcherLayer } from '@gyomu/infra/holiday';
import { initLoggerFromEnv } from '@gyomu/infra';
import { GyomuRepositoryLayer } from '@gyomu/infra/gyomu';

await initLoggerFromEnv();
const batchLayer = Layer.mergeAll(
  MainLayer,
  ConfigLayer,
  GyomuRepositoryLayer,
  JPXHolidayFetcherLayer,
)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer));
const runner = makeRunner(batchLayer);

const result = await runner(syncHoliday('JP'));
console.log(JSON.stringify(result));
