import { createDateOnly } from '../../infrastructure/date/dateConverter.js';
import {
  BusinessCalendar,
  BusinessCalendarService,
} from '../../gyomu/date/BusinessCalendar.js';
import { addDays, addMonths, format, subDays } from 'date-fns';
import { DBError } from '../../errors.js';
import { Effect, Layer, ServiceMap } from 'effect';
import { GyomuRepository } from '../../gyomu/GyomuRepository.js';
import { fromSync } from '@gyomu/shared/effect';
import {
  Date2LocalDate,
  LocalDate,
  LocalDate2Date,
} from '@gyomu/shared/entity';
import { ValueError } from '@gyomu/shared';

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

export class VariableTranslatorService extends ServiceMap.Service<
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
>()('VariableTranslatorService', {
  make: Effect.gen(function* () {
    const marketAccessService = yield* BusinessCalendarService;
    const gyomuRepository = yield* GyomuRepository;

    const supportedMarkets =
      yield* gyomuRepository.marketHoliday.findDistinctMarkets();

    //const translate = (keyword: string, targetDate: LocalDate): Effect.Effect<string, ValueError> => {
    //const parts = keyword.split('$');
    const initialTranslateContext = (market: string) => {
      if (!supportedMarkets.includes(market)) {
        return Effect.fail(new ValueError(`Unsupported market: ${market}`));
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
            throw new ValueError(`Format string is required for date variable`);
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
              : Effect.fail(new ValueError('No keyword: Not supported')),
          ),
        );
      });
    };

    return {
      parse,
      parseDate,
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}

const render = (
  ctx: TranslateContext,
  part: string,
  targetDate: LocalDate,
): Effect.Effect<TranslateContext, ValueError> => {
  if (ctx.state.kind === 'DatePending') {
    if (!part) {
      return Effect.fail(
        new ValueError(`Format string is required for date variable`),
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
            new ValueError(`Format string is required for date variable`),
          );
        }
        const formatted = yield* fromSync(
          ValueError,
          `Failed to translate date: ${part}`,
        )(() => format(dateResult, part));

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
          new ValueError(`Unsupported variable type: ${ctx.variableType}`),
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
      return Effect.fail(new ValueError(`${dateParameter} is not supported`));
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
        new ValueError(`Date keyword repeated before format: ${part}`),
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

// export class VariableTranslator {
//   readonly #marketAccess: MarketDateAccess;
//   __supportedMarkets: string[] = new Array<string>();
//   //readonly #ctx: Context;
//   private constructor(marketAccess: MarketDateAccess) {
//     //constructor(marketAccess: MarketDateAccess, ctx: Context) {
//     this.#marketAccess = marketAccess;
//     //this.#ctx = ctx;
//   }
//   static getTranslator(market: string): GyomuResultAsync<VariableTranslator> {
//     return MarketDateAccess.getMarketAccess(market)
//       .map((access) => new VariableTranslator(access))
//       .andThen((translator) => translator.init().map(() => translator));
//   }

//   init(): GyomuResultAsync<void> {
//     return this.#getSupportedMarket().map((markets) => {
//       this.__supportedMarkets = markets;
//     });
//   }
//   parse(inputString: string, targetDate: LocalDate): GyomuResultAsync<string> {
//     const startIndex = inputString.indexOf('{%');
//     const endIndex = inputString.indexOf('%}');

//     if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
//       const prefix = inputString.substring(0, startIndex);
//       const keyword = inputString.substring(startIndex + 2, endIndex);
//       const suffix = inputString.substring(endIndex + 2);

//       return this.#translate(keyword, targetDate).andThen((translated) =>
//         this.parse(prefix + translated + suffix, targetDate),
//       );
//     }

//     return okAsync(inputString);
//   }

//   #handleParseDatePart(
//     ctx: ParseDateContext,
//     part: string,
//     targetDate: LocalDate,
//   ): GyomuResultAsync<ParseDateContext> {
//     // すでに結果が出ているなら何もしない（reduce 停止相当）
//     if (ctx.kind === 'done') {
//       return okAsync(ctx);
//     }

//     // 数値 → factorIndex
//     if (!isNaN(Number(part))) {
//       return okAsync({
//         ...ctx,
//         factorIndex: Number(part),
//       });
//     }

//     // Market
//     if (this.__supportedMarkets.includes(part)) {
//       return MarketDateAccess.getMarketAccess(part).map((access) => ({
//         ...ctx,
//         marketAccess: access,
//       }));
//     }

//     // Date keyword
//     if (part in VariableDateKeyword) {
//       const dateResult = this.#translateDate(
//         ctx.marketAccess,
//         targetDate,
//         part,
//         ctx.factorIndex,
//       );

//       return dateResult.isErr()
//         ? errAsync(dateResult.error)
//         : okAsync({
//             kind: 'done',
//             result: localdateResult.value,
//           });
//     }

//     // if (dateResult.isErr()) {
//     //   return errAsync(dateResult.error);
//     // }

//     // return okAsync({
//     //   ...ctx,
//     //   result: localdateResult.value,
//     // });
//     //}

//     // その他は無視
//     return okAsync(ctx);
//   }

//   parseDate(keyword: string, targetDate: LocalDate): GyomuResultAsync<Date> {
//     const parts = keyword.split('$');

//     const initial: GyomuResultAsync<ParseDateContext> = okAsync({
//       kind: 'processing',
//       factorIndex: 1,
//       marketAccess: this.#marketAccess,
//     });

//     return parts
//       .reduce(
//         (ctxR, part) =>
//           ctxR.andThen((ctx) =>
//             this.#handleParseDatePart(ctx, part, targetDate),
//           ),
//         initial,
//       )
//       .andThen((ctx) =>
//         ctx.kind === 'done'
//           ? okAsync(ctx.result)
//           : errAsync(new ValueError('No keyword: Not supported')),
//       );
//   }
//   // #returnPromiseSuccess<T>(val: T): PromiseResult<T, ValueError> {
//   //   return new Promise((resolve) => {
//   //     resolve(success(val));
//   //   });
//   // }
//   // #returnPromiseFail<T>(message: string): PromiseResult<T, ValueError> {
//   //   return new Promise((resolve) => {
//   //     resolve(fail(message, ValueError));
//   //   });
//   // }
//   #translateDate(
//     targetMarketAccess: MarketDateAccess,
//     targetDate: LocalDate,
//     dateParameter: VariableDateKeyword,
//     factorIndex: number,
//   ): GyomuResult<Date> {
//     switch (dateParameter) {
//       case VariableDateKeyword.TODAY:
//         return ok(targetDate);
//       case VariableDateKeyword.BBOM:
//         // Business Day of Beginning of Month
//         return ok(
//           targetMarketAccess.businessDayOfBeginningMonthWithOffset(
//             targetDate,
//             factorIndex,
//           ),
//         );
//       case VariableDateKeyword.NEXTBBOM:
//         // Business Day of Beginning of Next Month
//         return ok(
//           targetMarketAccess.businessDayOfBeginningOfNextMonthWithOffset(
//             targetDate,
//             factorIndex,
//           ),
//         );
//       case VariableDateKeyword.BOM:
//         // Beginning of Month
//         return ok(
//           addDays(
//             createDateOnly(
//               targetDate.getFullYear(),
//               targetDate.getMonth() + 1,
//               1,
//             ),
//             factorIndex - 1,
//           ),
//         );
//       case VariableDateKeyword.BEOM:
//         // Business Day of End Of Month
//         return ok(
//           targetMarketAccess.businessDayOfEndMonthWithOffset(
//             targetDate,
//             factorIndex,
//           ),
//         );
//       case VariableDateKeyword.NEXTBEOM:
//         // Business Day of End of Next Month
//         return ok(
//           targetMarketAccess.businessDayOfBeginningMonthWithOffset(
//             addMonths(targetDate, 2),
//             -factorIndex,
//           ),
//         );
//       case VariableDateKeyword.PREVBEOM:
//         // Business Day of End of Previous Month

//         return ok(
//           targetMarketAccess.businessDay(
//             createDateOnly(
//               targetDate.getFullYear(),
//               targetDate.getMonth() + 1,
//               1,
//             ),
//             -factorIndex,
//           ),
//         );
//       case VariableDateKeyword.EOM:
//         // End Of Month
//         return ok(
//           subDays(
//             createDateOnly(
//               addMonths(targetDate, 1).getFullYear(),
//               addMonths(targetDate, 1).getMonth() + 1,
//               1,
//             ),
//             factorIndex,
//           ),
//         );
//       case VariableDateKeyword.NEXTBUS:
//         // Next Business Day
//         return ok(targetMarketAccess.businessDay(targetDate, factorIndex));
//       case VariableDateKeyword.NEXTDAY:
//         // Next Day
//         return ok(addDays(targetDate, factorIndex));
//       case VariableDateKeyword.PREVBUS:
//         // Previous Business Day
//         return ok(targetMarketAccess.businessDay(targetDate, -factorIndex));
//       case VariableDateKeyword.PREVDAY:
//         // Previous Day
//         return ok(subDays(targetDate, factorIndex));
//       case VariableDateKeyword.EOY:
//         // End of Year
//         return ok(
//           subDays(
//             createDateOnly(targetDate.getFullYear() + 1, 1, 1),
//             factorIndex,
//           ),
//         );
//       case VariableDateKeyword.BEOY:
//         // Business Day of End of Year
//         return ok(
//           targetMarketAccess.businessDay(
//             createDateOnly(targetDate.getFullYear() + 1, 1, 1),
//             -factorIndex,
//           ),
//         );
//       case VariableDateKeyword.BBOY:
//         // Business Day Of Beginning of Year
//         return ok(
//           targetMarketAccess.businessDay(
//             createDateOnly(targetDate.getFullYear(), 1, 1),
//             factorIndex -
//               (targetMarketAccess.isBusinessDay(
//                 createDateOnly(targetDate.getFullYear(), 1, 1),
//               )
//                 ? 1
//                 : 0),
//           ),
//         );
//       case VariableDateKeyword.BOY:
//         // Beginning of Year
//         return ok(
//           addDays(
//             createDateOnly(targetDate.getFullYear(), 1, 1),
//             factorIndex - 1,
//           ),
//         );
//       default:
//         return err(new ValueError(`${dateParameter} is not supported`));
//     }
//   }
//   #initialTranslateContext(): TranslateContext {
//     return {
//       state: { kind: 'Normal' },
//       factorIndex: 1,
//       variableType: VariableType.Date,
//       marketAccess: this.#marketAccess,
//       output: [],
//     };
//   }
//   // #handlePart(
//   //   ctx: TranslateContext,
//   //   part: string,
//   //   targetDate: LocalDate
//   // ): GyomuResultAsync<TranslateContext, ValueError> {

//   //   /* number */
//   //   if (!isNaN(parseInt(part))) {
//   //     return okAsync({
//   //       ...ctx,
//   //       factorIndex: parseInt(part),
//   //     });
//   //   }

//   //   /* market */
//   //   if (this.__supportedMarkets.includes(part)) {
//   //     return MarketDateAccess.getMarketAccess(part).mapErr(
//   //       (e) => new ValueError(`Fail to retrieve market data ${part}`, e)
//   //     ).map((access) => ({
//   //       ...ctx,
//   //       marketAccess: access,
//   //     }));
//   //   }

//   //   /* date keyword */
//   //   if (part in VariableDateKeyword) {
//   //     return result2Async(
//   //       this.#translateDate(
//   //         ctx.marketAccess,
//   //         targetDate,
//   //         part,
//   //         ctx.factorIndex
//   //       )
//   //     ).map((date) => ({
//   //       ...ctx,
//   //       date,
//   //     }));
//   //   }

//   //   /* variable switch */
//   //   switch (part) {
//   //     case 'PARAMMASTER':
//   //       return okAsync({ ...ctx, variableType: VariableType.ParamMaster });
//   //     case 'PARAMDICTIONARY':
//   //       return okAsync({
//   //         ...ctx,
//   //         variableType: VariableType.ParamMasterStringDictionary,
//   //       });
//   //     case 'ARGUMENT':
//   //       return okAsync({ ...ctx, variableType: VariableType.Argument });
//   //     case 'ATTACHMENTFILE':
//   //       return okAsync({ ...ctx, variableType: VariableType.ArgumentFile });
//   //   }

//   //   /* render */
//   //   return this.#render(ctx, part);
//   // }
//   // #render(
//   //   ctx: TranslateContext,
//   //   part: string
//   // ): GyomuResultAsync<TranslateContext, ValueError> {

//   //   switch (ctx.variableType) {
//   //     case VariableType.Date:
//   //       if (!ctx.date) {
//   //         return errAsync(
//   //           new ValueError(`Invalid Keyword Setting for date`)
//   //         );
//   //       }
//   //       return okAsync({
//   //         ...ctx,
//   //         output: [...ctx.output, format(ctx.date, part)],
//   //       });

//   //     case VariableType.ParamMaster:
//   //     case VariableType.ParamMasterStringDictionary:
//   //       return okAsync({
//   //         ...ctx,
//   //         output: [...ctx.output, ''],
//   //       });

//   //     case VariableType.Argument:
//   //       return okAsync({
//   //         ...ctx,
//   //         output: [...ctx.output, String(arguments[ctx.factorIndex - 1])],
//   //       });

//   //     case VariableType.ArgumentFile:
//   //       return okAsync(ctx);
//   //   }
//   // }
//   #handlePart(
//     ctx: TranslateContext,
//     part: string,
//     targetDate: LocalDate,
//   ): GyomuResultAsync<TranslateContext> {
//     /* number */
//     if (!isNaN(Number(part))) {
//       return okAsync({
//         ...ctx,
//         factorIndex: Number(part),
//       });
//     }

//     /* market */
//     if (this.__supportedMarkets.includes(part)) {
//       return MarketDateAccess.getMarketAccess(part)
//         .mapErr(
//           (e) => new ValueError(`Fail to retrieve market data ${part}`, e),
//         )
//         .map((access) => ({
//           ...ctx,
//           marketAccess: access,
//         }));
//     }

//     /* date keyword (TODAY, YESTERDAY, etc) */
//     if (part in VariableDateKeyword) {
//       if (ctx.state.kind === 'DatePending') {
//         return errAsync(
//           new ValueError(`Date keyword repeated before format: ${part}`),
//         );
//       }
//       return result2Async(
//         this.#translateDate(
//           ctx.marketAccess,
//           targetDate,
//           part,
//           ctx.factorIndex,
//         ),
//       ).map((date) => ({
//         ...ctx,
//         state: { kind: 'DatePending', date },
//       }));
//     }

//     /* variable switch */
//     switch (part) {
//       case 'PARAMMASTER':
//         return okAsync({ ...ctx, variableType: VariableType.ParamMaster });

//       case 'PARAMDICTIONARY':
//         return okAsync({
//           ...ctx,
//           variableType: VariableType.ParamMasterStringDictionary,
//         });

//       case 'ARGUMENT':
//         return okAsync({ ...ctx, variableType: VariableType.Argument });

//       case 'ATTACHMENTFILE':
//         return okAsync({ ...ctx, variableType: VariableType.ArgumentFile });
//     }

//     /* render */
//     return this.#render(ctx, part, targetDate);
//   }

//   #render(
//     ctx: TranslateContext,
//     part: string,
//     targetDate: LocalDate,
//   ): GyomuResultAsync<TranslateContext> {
//     if (ctx.state.kind === 'DatePending') {
//       const formatted = format(ctx.state.date, part);

//       return okAsync({
//         state: { kind: 'Normal' },
//         factorIndex: ctx.factorIndex,
//         variableType: VariableType.Date,
//         marketAccess: ctx.marketAccess,
//         output: [...ctx.output, formatted],
//       });
//     }
//     switch (ctx.variableType) {
//       case VariableType.Date: {
//         const dateResult = this.#translateDate(
//           ctx.marketAccess,
//           targetDate,
//           VariableDateKeyword.TODAY, // ← 直前状態から決まるなら state 化
//           ctx.factorIndex,
//         );

//         if (dateResult.isErr()) {
//           return errAsync(dateResult.error);
//         }

//         const formatted = format(dateResult.value, part);

//         return okAsync({
//           ...ctx,
//           output: [...ctx.output, formatted],
//         });
//       }

//       // case VariableType.Argument:
//       //   return okAsync({
//       //     ...ctx,
//       //     output: [...ctx.output, arguments[ctx.factorIndex - 1]],
//       //   });

//       case VariableType.ParamMaster:
//       case VariableType.ParamMasterStringDictionary:
//         return okAsync({
//           ...ctx,
//           output: [...ctx.output, ''],
//         });

//       default:
//         return errAsync(
//           new ValueError(`Unsupported variable type: ${ctx.variableType}`),
//         );
//     }
//   }

//   #translate(keyword: string, targetDate: LocalDate): GyomuResultAsync<string> {
//     const parts = keyword.split('$');
//     const initial: GyomuResultAsync<TranslateContext> = okAsync(
//       this.#initialTranslateContext(),
//     );
//     return parts
//       .reduce(
//         (ctxR, part) =>
//           ctxR.andThen((ctx) => this.#handlePart(ctx, part, targetDate)),
//         initial,
//       )
//       .map((ctx) => ctx.output.join(''));
//   }

//   #getSupportedMarket() {
//     // const distinctMarkets = await prisma.gyomu_market_holiday.findMany({
//     //   select: { market: true },
//     //   distinct: ['market'],
//     // });
//     // const markets = new Array<string>();
//     // for (var row of distinctMarkets) {
//     //   markets.push(row.market);
//     // }
//     // return markets;
//     return genericDBFunction<{ market: string }[]>(
//       'load distinct markets',
//       () =>
//         prisma.gyomu_market_holiday.findMany({
//           select: { market: true },
//           distinct: ['market'],
//         }),
//       [],
//     ).map((rows) => rows.map((r) => r.market));
//   }
// }
