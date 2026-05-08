import { Layer } from 'effect';
import { ConfigLayer, PlatformLayer } from '@gyomu/infra';
import { MainLayer } from '@gyomu/infra';
import { KyselyService } from '@gyomu/infra/db';
import { MssqlService } from '@gyomu/infra/db';
import { makeRunner } from '../../../packages/core/dist/effect/index.js';
import { syncHoliday } from '@gyomu/core/usecase/syncHolidayService';
import { JPXHolidayFetcherLayer } from '@gyomu/infra/holiday';
import { initLoggerFromEnv } from '@gyomu/infra';
import { GyomuRepositoryLayer } from '@gyomu/infra/gyomu';

const main = async () => {
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
  setInterval(() => {
    // @ts-ignore
    const handles = (process as any)._getActiveHandles?.() ?? [];
    // @ts-ignore
    const requests = (process as any)._getActiveRequests?.() ?? [];

    console.log('=== Active Handles ===');
    for (const h of handles) {
      console.log(h.constructor?.name, h);
    }

    console.log('=== Active Requests ===');
    for (const r of requests) {
      console.log(r.constructor?.name, r);
    }
  }, 2000);
};

main()
  .then(() => {
    console.log('exit');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
