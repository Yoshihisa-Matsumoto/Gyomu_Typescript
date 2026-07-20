import { Context } from 'effect'
import type { Effect } from 'effect'
import type { GyomuRepository } from '../../gyomu/GyomuRepository.js'
import type { DBError } from '../../error/DBError.js'
import type { ValueError } from '../../error/ValueError.js'
import type { BusinessCalendarService } from '../../gyomu/date/BusinessCalendar.js'
import type { LocalDate } from '../../entity/date.js'

/**
 * Provides services for parsing variables and dates within specific market contexts.
 */
export class VariableTranslatorService extends Context.Service<
  VariableTranslatorService,
  {
    parse: (
      inputString: string,
      targetDate: LocalDate,
      market: string,
    ) => Effect.Effect<string, DBError | ValueError, BusinessCalendarService | GyomuRepository>
    parseDate: (
      keyword: string,
      targetDate: LocalDate,
      market: string,
    ) => Effect.Effect<LocalDate, DBError | ValueError, BusinessCalendarService | GyomuRepository>
  }
>()('VariableTranslatorService') {}
