import { createTool } from '@mastra/core/tools';
import { HolidayRangeSchema } from '../../../schemas/ai/holiday.js';
import { Effect, Layer, Schema } from 'effect';
import { LocalDate, LocalDateSchema } from '@gyomu/shared/entity';
import { BusinessCalendarService } from '../../../gyomu/date/BusinessCalendar.js';
import { MainLayer } from '../../../infrastructure/layer.js';
import { ConfigLayer } from '../../../infrastructure/config.js';
import { GyomuRepository } from '../../../gyomu/GyomuRepository.js';
import { KyselyService } from '../../../infrastructure/db/KyselyService.js';
import { MssqlService } from '../../../infrastructure/db/MssqlService.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../../../infrastructure/runtime.js';

const targetLayer = Layer.mergeAll(
  BusinessCalendarService.live,
  MainLayer,
  ConfigLayer,
  GyomuRepository.live,
)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const runner = makeRunner(targetLayer);

export const getHolidayTool = createTool({
  id: 'getHoliday',
  description:
    'Retrieve holiday list in Japan. date format must be YYYY-MM-DD ',
  inputSchema: Schema.toStandardSchemaV1(
    Schema.toStandardJSONSchemaV1(HolidayRangeSchema),
  ),
  outputSchema: Schema.toStandardSchemaV1(
    Schema.toStandardJSONSchemaV1(Schema.Array(LocalDateSchema)),
  ),
  execute: async (inputData) => {
    const program = Effect.gen(function* () {
      const marketService = yield* BusinessCalendarService;
      const access = yield* marketService.get('JP');
      return access.getHolidays(
        inputData.from as LocalDate,
        inputData.to as LocalDate,
      );
    });
    return await runner(program);
  },
});
