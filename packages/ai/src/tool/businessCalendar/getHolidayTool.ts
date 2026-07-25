import { createTool } from '@mastra/core/tools'
import { HolidayRangeSchema } from '@gyomu/schema/schemas/ai'
import { Effect, Layer, Schema } from 'effect'
import { LocalDateSchema } from '@gyomu/schema/entity'
import { BusinessCalendarService } from '@gyomu/schema/gyomu/date'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { KyselyService, MssqlService } from '@gyomu/infra/db'
import { BusinessCalendarServiceLayer } from '@gyomu/infra/gyomu/date'
import { GyomuRepositoryLayer } from '@gyomu/infra/gyomu'
import { makeRunner } from '@gyomu/schema/effect'
import type { LocalDate } from '@gyomu/schema/entity'

const targetLayer = Layer.mergeAll(
  BusinessCalendarServiceLayer,
  MainLayer,
  ConfigLayer,
  GyomuRepositoryLayer,
)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(MssqlService.live))
  .pipe(Layer.provideMerge(ConfigLayer))
  .pipe(Layer.provideMerge(PlatformLayer))
const runner = makeRunner(targetLayer)

/**
 * An AI tool that retrieves a list of holidays in Japan within a specified date range.
 *
 * @returns Returns a promise that resolves to an array of local dates representing holidays.
 */
export const getHolidayTool = createTool({
  id: 'getHoliday',
  description: 'Retrieve holiday list in Japan. date format must be YYYY-MM-DD ',
  inputSchema: Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(HolidayRangeSchema)),
  outputSchema: Schema.toStandardSchemaV1(
    Schema.toStandardJSONSchemaV1(Schema.Array(LocalDateSchema)),
  ),
  execute: async (inputData) => {
    const program = Effect.gen(function* () {
      const marketService = yield* BusinessCalendarService
      const access = yield* marketService.get('JP')
      return access.getHolidays(inputData.from as LocalDate, inputData.to as LocalDate)
    })
    return await runner(program)
  },
})
