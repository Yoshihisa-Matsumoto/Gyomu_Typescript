import { createTool } from '@mastra/core/tools';
import { HolidayRangeSchema } from '@gyomu/core/schemas/ai/holiday';
import { Effect, Layer, Schema } from 'effect';
import { LocalDate, LocalDateSchema } from '@gyomu/core/entity';
import { BusinessCalendarService } from '@gyomu/core/gyomu/date';
import { MainLayer, PlatformLayer } from '@gyomu/infra';
import { ConfigLayer } from '@gyomu/infra';
import { KyselyService } from '@gyomu/infra/db';
import { MssqlService } from '@gyomu/infra/db';
import { makeRunner } from '../../../../core/dist/effect/index.js';
import { BusinessCalendarServiceLayer } from '@gyomu/infra/gyomu/date';
import { GyomuRepositoryLayer } from '@gyomu/infra/gyomu';

const targetLayer = Layer.mergeAll(
  BusinessCalendarServiceLayer,
  MainLayer,
  ConfigLayer,
  GyomuRepositoryLayer,
)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer));
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
