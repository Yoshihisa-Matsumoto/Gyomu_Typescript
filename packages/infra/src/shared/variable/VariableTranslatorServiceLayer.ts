import { createDateOnly } from '@gyomu/core/shared/entity';
import {
  BusinessCalendar,
  BusinessCalendarService,
} from '@gyomu/core/gyomu/date';
import { addDays, addMonths, format, subDays } from 'date-fns';
import { DBError } from '@gyomu/core';
import { Effect, Layer } from 'effect';
import { GyomuRepository } from '@gyomu/core/gyomu';
import { fromSync } from '@gyomu/core/shared/effect';
import {
  Date2LocalDate,
  LocalDate,
  LocalDate2Date,
} from '@gyomu/core/shared/entity';
import { ValueError } from '@gyomu/core';
import { VariableTranslatorService } from '@gyomu/core/shared/variable';

const VariableType = {
  Date: 'Date',
  ParamMaster: 'Parameter',
  ParamMasterStringDictionary: 'ParameterDictionary',
  Argument: 'Argument',
  ArgumentFile: 'File',
} as const;

type VariableType = (typeof VariableType)[keyof typeof VariableType];

const VariableDateKeyword = {
  TODAY: 'TODAY',
  BBOM: 'BBOM',
  NEXTBBOM: 'NEXTBBOM',
  BOM: 'BOM',
  BEOM: 'BEOM',
  NEXTBEOM: 'NEXTBEOM',
  PREVBEOM: 'PREVBEOM',
  EOM: 'EOM',
  NEXTBUS: 'NEXTBUS',
  NEXTDAY: 'NEXTDAY',
  PREVBUS: 'PREVBUS',
  PREVDAY: 'PREVDAY',
  EOY: 'EOY',
  BEOY: 'BEOY',
  BBOY: 'BBOY',
  BOY: 'BOY',
};
type VariableDateKeyword =
  (typeof VariableDateKeyword)[keyof typeof VariableDateKeyword];
// type TranslateContext = {
//   factorIndex: number;
//   variableType: VariableType;
//   marketAccess: MarketDateAccess;
//   date?: LocalDate;
//   output: string[];
// };
type TranslateState =
  | { kind: 'Normal' }
  | { kind: 'DatePending'; date: LocalDate };

type TranslateContext = {
  factorIndex: number;
  variableType: VariableType;
  marketAccess: BusinessCalendar;
  state: TranslateState;
  output: string[];
};

type ParseDateContext =
  | {
      kind: 'processing';
      factorIndex: number;
      marketAccess: BusinessCalendar;
    }
  | {
      kind: 'done';
      result: LocalDate;
    };

export const VariableTranslatorServiceLayer = Layer.effect(
  VariableTranslatorService,

  Effect.gen(function* () {
    const marketAccessService = yield* BusinessCalendarService;
    const gyomuRepository = yield* GyomuRepository;

    const supportedMarkets =
      yield* gyomuRepository.marketHoliday.findDistinctMarkets();

    //const translate = (keyword: string, targetDate: LocalDate): Effect.Effect<string, ValueError> => {
    //const parts = keyword.split('$');
    const initialTranslateContext = (market: string) => {
      if (!supportedMarkets.includes(market)) {
        return Effect.fail(
          new ValueError({
            message: `Unsupported market`,
            field: 'market',
            value: market,
            cause: undefined,
          }),
        );
      }
      return Effect.gen(function* () {
        const marketAccess = yield* marketAccessService.get(market);
        return {
          state: { kind: 'Normal' },
          factorIndex: 1,
          variableType: VariableType.Date,
          marketAccess: marketAccess,
          output: [],
        } as TranslateContext;
      });
    };
    const translate = (
      keyword: string,
      targetDate: LocalDate,
      market: string,
    ): Effect.Effect<
      string,
      DBError | ValueError,
      BusinessCalendarService | GyomuRepository
    > => {
      const parts = keyword.split('$');
      const initial = initialTranslateContext(market);
      const context = parts.reduce<
        Effect.Effect<
          TranslateContext,
          DBError | ValueError,
          BusinessCalendarService | GyomuRepository
        >
      >(
        (ctxR, part) =>
          ctxR.pipe(
            Effect.flatMap((ctx) =>
              handlePart(ctx, part, targetDate, supportedMarkets),
            ),
          ),
        initial,
      );

      return context.pipe(
        Effect.map((ctx) => {
          if (ctx.state.kind === 'DatePending') {
            throw new ValueError({
              message: `Format string is required for date variable`,
              cause: undefined,
              value: { context: ctx, keyword: keyword },
            });
          }
          return ctx.output.join('');
        }),
      );
    };
    const parse = (
      inputString: string,
      targetDate: LocalDate,
      market: string,
    ): Effect.Effect<
      string,
      DBError | ValueError,
      BusinessCalendarService | GyomuRepository
    > => {
      const startIndex = inputString.indexOf('{%');
      const endIndex = inputString.indexOf('%}');

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const prefix = inputString.substring(0, startIndex);
        const keyword = inputString.substring(startIndex + 2, endIndex);
        const suffix = inputString.substring(endIndex + 2);

        return translate(keyword, targetDate, market).pipe(
          Effect.flatMap((translated) =>
            parse(prefix + translated + suffix, targetDate, market),
          ),
        );
      }

      return Effect.succeed(inputString);
    };

    const parseDate = (
      keyword: string,
      targetDate: LocalDate,
      market: string,
    ): Effect.Effect<
      LocalDate,
      DBError | ValueError,
      BusinessCalendarService | GyomuRepository
    > => {
      const parts = keyword.split('$');

      return Effect.gen(function* () {
        const marketAccess = yield* marketAccessService.get(market);
        const initial: Effect.Effect<ParseDateContext> = Effect.succeed({
          kind: 'processing',
          factorIndex: 1,
          marketAccess: marketAccess,
        });

        const context = parts.reduce<
          Effect.Effect<
            ParseDateContext,
            DBError | ValueError,
            BusinessCalendarService | GyomuRepository
          >
        >(
          (ctxR, part) =>
            ctxR.pipe(
              Effect.flatMap((ctx) =>
                handleParseDatePart(ctx, part, targetDate, supportedMarkets),
              ),
            ),
          initial,
        );

        return yield* context.pipe(
          Effect.flatMap((ctx) =>
            ctx.kind === 'done'
              ? Effect.succeed(ctx.result)
              : Effect.fail(
                  new ValueError({
                    message: 'No keyword: Not supported',
                    cause: undefined,
                    value: { context: ctx, keyword: keyword },
                  }),
                ),
          ),
        );
      });
    };

    return {
      parse,
      parseDate,
    };
  }),
);

const render = (
  ctx: TranslateContext,
  part: string,
  targetDate: LocalDate,
): Effect.Effect<TranslateContext, ValueError> => {
  if (ctx.state.kind === 'DatePending') {
    if (!part) {
      return Effect.fail(
        new ValueError({
          message: `Format string is required for date variable`,
          cause: undefined,
          value: { context: ctx, part: part },
        }),
      );
    }
    const formatted = format(ctx.state.date, part);

    return Effect.succeed({
      state: { kind: 'Normal' },
      factorIndex: ctx.factorIndex,
      variableType: VariableType.Date,
      marketAccess: ctx.marketAccess,
      output: [...ctx.output, formatted],
    });
  }
  return Effect.gen(function* () {
    switch (ctx.variableType) {
      case VariableType.Date: {
        const dateResult = yield* translateDate(
          ctx.marketAccess,
          targetDate,
          VariableDateKeyword.TODAY, // ← 直前状態から決まるなら state 化
          ctx.factorIndex,
        );
        if (!part) {
          return yield* Effect.fail(
            new ValueError({
              message: `Format string is required for date variable`,
              value: { context: ctx },
              cause: undefined,
            }),
          );
        }
        const formatted = yield* fromSync(ValueError, () => ({
          message: `Failed to translate date`,
          value: { dateString: dateResult, format: part },
        }))(() => format(dateResult, part));

        return {
          ...ctx,
          output: [...ctx.output, formatted],
        };
      }

      // case VariableType.Argument:
      //   return okAsync({
      //     ...ctx,
      //     output: [...ctx.output, arguments[ctx.factorIndex - 1]],
      //   });

      case VariableType.ParamMaster:
      case VariableType.ParamMasterStringDictionary:
        return {
          ...ctx,
          output: [...ctx.output, ''],
        };

      default:
        return yield* Effect.fail(
          new ValueError({
            message: `Unsupported variable typ`,
            value: { context: ctx, part },
            cause: undefined,
          }),
        );
    }
  });
};

const translateDate = (
  targetMarketAccess: BusinessCalendar,
  targetDate: LocalDate,
  dateParameter: VariableDateKeyword,
  factorIndex: number,
): Effect.Effect<LocalDate, ValueError> => {
  const targetDt = LocalDate2Date(targetDate);
  switch (dateParameter) {
    case VariableDateKeyword.TODAY:
      return Effect.succeed(targetDate);
    case VariableDateKeyword.BBOM:
      // Business Day of Beginning of Month
      return Effect.succeed(
        targetMarketAccess.businessDayOfBeginningMonthWithOffset(
          targetDate,
          factorIndex,
        ),
      );
    case VariableDateKeyword.NEXTBBOM:
      // Business Day of Beginning of Next Month
      return Effect.succeed(
        targetMarketAccess.businessDayOfBeginningOfNextMonthWithOffset(
          targetDate,
          factorIndex,
        ),
      );
    case VariableDateKeyword.BOM:
      // Beginning of Month
      return Effect.succeed(
        Date2LocalDate(
          addDays(
            createDateOnly(targetDt.getFullYear(), targetDt.getMonth() + 1, 1),
            factorIndex - 1,
          ),
        ),
      );
    case VariableDateKeyword.BEOM:
      // Business Day of End Of Month
      return Effect.succeed(
        targetMarketAccess.businessDayOfEndMonthWithOffset(
          targetDate,
          factorIndex,
        ),
      );
    case VariableDateKeyword.NEXTBEOM:
      // Business Day of End of Next Month
      return Effect.succeed(
        targetMarketAccess.businessDayOfBeginningMonthWithOffset(
          Date2LocalDate(addMonths(targetDt, 2)),
          -factorIndex,
        ),
      );
    case VariableDateKeyword.PREVBEOM:
      // Business Day of End of Previous Month

      return Effect.succeed(
        targetMarketAccess.businessDay(
          Date2LocalDate(
            createDateOnly(targetDt.getFullYear(), targetDt.getMonth() + 1, 1),
          ),
          -factorIndex,
        ),
      );
    case VariableDateKeyword.EOM:
      // End Of Month
      return Effect.succeed(
        Date2LocalDate(
          subDays(
            createDateOnly(
              addMonths(targetDt, 1).getFullYear(),
              addMonths(targetDt, 1).getMonth() + 1,
              1,
            ),
            factorIndex,
          ),
        ),
      );
    case VariableDateKeyword.NEXTBUS:
      // Next Business Day
      return Effect.succeed(
        targetMarketAccess.businessDay(targetDate, factorIndex),
      );
    case VariableDateKeyword.NEXTDAY:
      // Next Day
      return Effect.succeed(Date2LocalDate(addDays(targetDate, factorIndex)));
    case VariableDateKeyword.PREVBUS:
      // Previous Business Day
      return Effect.succeed(
        targetMarketAccess.businessDay(targetDate, -factorIndex),
      );
    case VariableDateKeyword.PREVDAY:
      // Previous Day
      return Effect.succeed(Date2LocalDate(subDays(targetDate, factorIndex)));
    case VariableDateKeyword.EOY:
      // End of Year
      return Effect.succeed(
        Date2LocalDate(
          subDays(
            Date2LocalDate(createDateOnly(targetDt.getFullYear() + 1, 1, 1)),
            factorIndex,
          ),
        ),
      );
    case VariableDateKeyword.BEOY:
      // Business Day of End of Year
      return Effect.succeed(
        targetMarketAccess.businessDay(
          Date2LocalDate(createDateOnly(targetDt.getFullYear() + 1, 1, 1)),
          -factorIndex,
        ),
      );
    case VariableDateKeyword.BBOY:
      // Business Day Of Beginning of Year
      return Effect.succeed(
        targetMarketAccess.businessDay(
          Date2LocalDate(createDateOnly(targetDt.getFullYear(), 1, 1)),
          factorIndex -
            (targetMarketAccess.isBusinessDay(
              Date2LocalDate(createDateOnly(targetDt.getFullYear(), 1, 1)),
            )
              ? 1
              : 0),
        ),
      );
    case VariableDateKeyword.BOY:
      // Beginning of Year
      return Effect.succeed(
        Date2LocalDate(
          addDays(
            createDateOnly(targetDt.getFullYear(), 1, 1),
            factorIndex - 1,
          ),
        ),
      );
    default:
      return Effect.fail(
        new ValueError({
          message: 'Not supported DateParameter',
          value: dateParameter,
          cause: undefined,
        }),
      );
  }
};

const handlePart = (
  ctx: TranslateContext,
  part: string,
  targetDate: LocalDate,
  supportedMarkets: string[],
): Effect.Effect<
  TranslateContext,
  ValueError | DBError,
  GyomuRepository | BusinessCalendarService
> => {
  /* number */
  if (!isNaN(Number(part))) {
    return Effect.succeed({
      ...ctx,
      factorIndex: Number(part),
    });
  }

  /* market */
  if (supportedMarkets.includes(part)) {
    return Effect.gen(function* () {
      const marketAccessService = yield* BusinessCalendarService;
      const marketAccess = yield* marketAccessService.get(part);
      return {
        ...ctx,
        marketAccess: marketAccess,
      };
    });
  }

  /* date keyword (TODAY, YESTERDAY, etc) */
  if (part in VariableDateKeyword) {
    if (ctx.state.kind === 'DatePending') {
      return Effect.fail(
        new ValueError({
          message: `Date keyword repeated before format`,
          value: { ctx, part },
          cause: undefined,
        }),
      );
    }
    return translateDate(
      ctx.marketAccess,
      targetDate,
      part,
      ctx.factorIndex,
    ).pipe(
      Effect.map((date) => ({
        ...ctx,
        state: { kind: 'DatePending', date },
      })),
    );
  }

  /* variable switch */
  switch (part) {
    case 'PARAMMASTER':
      return Effect.succeed({ ...ctx, variableType: VariableType.ParamMaster });

    case 'PARAMDICTIONARY':
      return Effect.succeed({
        ...ctx,
        variableType: VariableType.ParamMasterStringDictionary,
      });

    case 'ARGUMENT':
      return Effect.succeed({ ...ctx, variableType: VariableType.Argument });

    case 'ATTACHMENTFILE':
      return Effect.succeed({
        ...ctx,
        variableType: VariableType.ArgumentFile,
      });
  }

  /* render */
  return render(ctx, part, targetDate);
};

const handleParseDatePart = (
  ctx: ParseDateContext,
  part: string,
  targetDate: LocalDate,
  supportedMarkets: string[],
): Effect.Effect<
  ParseDateContext,
  ValueError | DBError,
  GyomuRepository | BusinessCalendarService
> => {
  // すでに結果が出ているなら何もしない（reduce 停止相当）
  if (ctx.kind === 'done') {
    return Effect.succeed(ctx);
  }

  // 数値 → factorIndex
  if (!isNaN(Number(part))) {
    return Effect.succeed({
      ...ctx,
      factorIndex: Number(part),
    });
  }

  return Effect.gen(function* () {
    // Market
    if (supportedMarkets.includes(part)) {
      const marketAccessService = yield* BusinessCalendarService;
      const marketAccess = yield* marketAccessService.get(part);
      return {
        ...ctx,
        marketAccess: marketAccess,
      };
    }

    // Date keyword
    if (part in VariableDateKeyword) {
      const dateResult = yield* translateDate(
        ctx.marketAccess,
        targetDate,
        part,
        ctx.factorIndex,
      );

      return {
        kind: 'done',
        result: dateResult,
      };
    }

    // if (dateResult.isErr()) {
    //   return errAsync(dateResult.error);
    // }

    // return okAsync({
    //   ...ctx,
    //   result: localdateResult.value,
    // });
    //}

    // その他は無視
    return ctx;
  });
};
