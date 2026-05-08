import { Effect, Context } from 'effect';
import { GyomuRepository } from '../../gyomu/GyomuRepository.js';
import { DBError } from '../../error/DBError.js';
import { ValueError } from '../../error/ValueError.js';
import { BusinessCalendarService } from '../../gyomu/date/BusinessCalendar.js';
import { LocalDate } from '../entity/date.js';

export class VariableTranslatorService extends Context.Service<
  VariableTranslatorService,
  {
    parse(
      inputString: string,
      targetDate: LocalDate,
      market: string,
    ): Effect.Effect<
      string,
      DBError | ValueError,
      BusinessCalendarService | GyomuRepository
    >;
    parseDate(
      keyword: string,
      targetDate: LocalDate,
      market: string,
    ): Effect.Effect<
      LocalDate,
      DBError | ValueError,
      BusinessCalendarService | GyomuRepository
    >;
  }
>()('VariableTranslatorService') {}
