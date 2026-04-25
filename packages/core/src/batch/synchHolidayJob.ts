import { Layer } from 'effect';
import { GyomuRepository } from '../gyomu/GyomuRepository.js';
import { ConfigLayer } from '../infrastructure/config.js';
import { MainLayer } from '../infrastructure/layer.js';
import { KyselyService } from '../infrastructure/db/KyselyService.js';
import { MssqlService } from '../infrastructure/db/MssqlService.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../infrastructure/runtime.js';
import { syncHoliday } from '../gyomu/date/syncHolidayService.js';

const batchLayer = Layer.mergeAll(MainLayer, ConfigLayer, GyomuRepository.live)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const runner = makeRunner(batchLayer);

const result = await runner(syncHoliday('JP'));
console.log(JSON.stringify(result));
