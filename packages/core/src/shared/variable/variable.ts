import { BusinessCalendarService } from '../../gyomu/date/BusinessCalendar.js';
import { DBError } from '../../errors.js';
import { Effect, Context } from 'effect';
import { GyomuRepository } from '../../gyomu/GyomuRepository.js';
import { LocalDate } from '@gyomu/shared/entity';
import { ValueError } from '@gyomu/shared';

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
