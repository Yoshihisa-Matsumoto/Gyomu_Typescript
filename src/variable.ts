import { createDateOnly } from './dateOperation';
import prisma from './dbsingleton';
import MarketDateAccess from './holidays';
import { addDays, addMonths, format, subDays } from 'date-fns';
import { DBError, ParseError } from './errors';
import { okAsync, ResultAsync ,Result, ok, err, result2Async, errAsync} from './result';
import { genericDBFunction } from './dbutil';

const VariableType = {
  Date: 'Date',
  ParamMaster: 'Parameter',
  ParamMasterStringDictionary: 'ParameterDictionary',
  Argument: 'Argument',
  ArgumentFile: 'File',
} as const;

type VariableType = typeof VariableType[keyof typeof VariableType];

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
  typeof VariableDateKeyword[keyof typeof VariableDateKeyword];
// type TranslateContext = {
//   factorIndex: number;
//   variableType: VariableType;
//   marketAccess: MarketDateAccess;
//   date?: Date;
//   output: string[];
// };
type TranslateState = 
  | { kind: 'Normal' }
  | { kind: 'DatePending'; date: Date };

type TranslateContext = {
      factorIndex: number;
      variableType: VariableType;
      marketAccess: MarketDateAccess;
      state: TranslateState;
      output: string[];
    };

type ParseDateContext =
  | {
      kind: 'processing';
      factorIndex: number;
      marketAccess: MarketDateAccess;
    }
  | {
      kind: 'done';
      result: Date;
    };
export class VariableTranslator {
  readonly #marketAccess: MarketDateAccess;
  __supportedMarkets: string[] = new Array<string>();
  //readonly #ctx: Context;
  private constructor(marketAccess: MarketDateAccess) {
    //constructor(marketAccess: MarketDateAccess, ctx: Context) {
    this.#marketAccess = marketAccess;
    //this.#ctx = ctx;
  }
  static getTranslator(
    market: string
  ): ResultAsync<VariableTranslator, DBError> {
    return MarketDateAccess.getMarketAccess(market)
    .map((access) => new VariableTranslator(access))
    .andThen((translator) =>
      translator.init().map(() => translator)
    );
  }

  init() : ResultAsync<void, DBError> {
    return this.#getSupportedMarket()
      .map(markets => {
        this.__supportedMarkets = markets;
      });
  }
  parse(
    inputString: string,
    targetDate: Date
  ): ResultAsync<string, ParseError> {
    const startIndex = inputString.indexOf('{%');
    const endIndex = inputString.indexOf('%}');

    if (
      startIndex !== -1 &&
      endIndex !== -1 &&
      endIndex > startIndex
    ) {
      const prefix = inputString.substring(0, startIndex);
      const keyword = inputString.substring(startIndex + 2, endIndex);
      const suffix = inputString.substring(endIndex + 2);

      return this.#translate(keyword, targetDate).andThen(
        (translated) =>
          this.parse(prefix + translated + suffix, targetDate)
      );
    }

    return okAsync(inputString);
  }
  
  #handleParseDatePart(
    ctx: ParseDateContext,
    part: string,
    targetDate: Date
  ): ResultAsync<ParseDateContext, ParseError> {
    // すでに結果が出ているなら何もしない（reduce 停止相当）
    if (ctx.kind === 'done') {
      return okAsync(ctx);
    }

    // 数値 → factorIndex
    if (!isNaN(Number(part))) {
      return okAsync({
        ...ctx,
        factorIndex: Number(part),
      });
    }

    // Market
    if (this.__supportedMarkets.includes(part)) {
      return MarketDateAccess.getMarketAccess(part).map((access) => ({
        ...ctx,
        marketAccess: access,
      }));
    }

    // Date keyword
    if (part in VariableDateKeyword) {
      const dateResult = this.#translateDate(
        ctx.marketAccess,
        targetDate,
        part,
        ctx.factorIndex
      );

      return dateResult.isErr()
        ? errAsync(dateResult.error)
        : okAsync({
            kind: 'done',
            result: dateResult.value,
          });
    }

      // if (dateResult.isErr()) {
      //   return errAsync(dateResult.error);
      // }

      // return okAsync({
      //   ...ctx,
      //   result: dateResult.value,
      // });
    //}

    // その他は無視
    return okAsync(ctx);
  }


  parseDate(
    keyword: string,
    targetDate: Date
  ): ResultAsync<Date, ParseError> {
    const parts = keyword.split('$');

    const initial: ResultAsync<ParseDateContext, ParseError> =
      okAsync({
        kind: 'processing',
        factorIndex: 1,
        marketAccess: this.#marketAccess,
      });

    return parts
      .reduce(
        (ctxR, part) =>
          ctxR.andThen((ctx) =>
            this.#handleParseDatePart(ctx, part, targetDate)
          ),
        initial
      )
      .andThen((ctx) =>
        ctx.kind === 'done'
          ? okAsync(ctx.result)
          : errAsync(new ParseError('No keyword: Not supported'))
      );
  }
  // #returnPromiseSuccess<T>(val: T): PromiseResult<T, ParseError> {
  //   return new Promise((resolve) => {
  //     resolve(success(val));
  //   });
  // }
  // #returnPromiseFail<T>(message: string): PromiseResult<T, ParseError> {
  //   return new Promise((resolve) => {
  //     resolve(fail(message, ParseError));
  //   });
  // }
  #translateDate(
    targetMarketAccess: MarketDateAccess,
    targetDate: Date,
    dateParameter: VariableDateKeyword,
    factorIndex: number
  ): Result<Date, ParseError> {
    switch (dateParameter) {
      case VariableDateKeyword.TODAY:
        return ok(targetDate);
      case VariableDateKeyword.BBOM:
        // Business Day of Beginning of Month
        return ok(
          targetMarketAccess.businessDayOfBeginningMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.NEXTBBOM:
        // Business Day of Beginning of Next Month
        return ok(
          targetMarketAccess.businessDayOfBeginningOfNextMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.BOM:
        // Beginning of Month
        return ok(
          addDays(
            createDateOnly(
              targetDate.getFullYear(),
              targetDate.getMonth() + 1,
              1
            ),
            factorIndex - 1
          )
        );
      case VariableDateKeyword.BEOM:
        // Business Day of End Of Month
        return ok(
          targetMarketAccess.businessDayOfEndMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.NEXTBEOM:
        // Business Day of End of Next Month
        const twoMonthAfter = addMonths(targetDate, 2);
        return ok(
          targetMarketAccess.businessDayOfBeginningMonthWithOffset(
            twoMonthAfter,
            -factorIndex
          )
        );
      case VariableDateKeyword.PREVBEOM:
        // Business Day of End of Previous Month
        const bom = createDateOnly(
          targetDate.getFullYear(),
          targetDate.getMonth() + 1,
          1
        );
        return ok(targetMarketAccess.businessDay(bom, -factorIndex));
      case VariableDateKeyword.EOM:
        // End Of Month
        const nextMonth = addMonths(targetDate, 1);
        return ok(
          subDays(
            createDateOnly(
              nextMonth.getFullYear(),
              nextMonth.getMonth() + 1,
              1
            ),
            factorIndex
          )
        );
      case VariableDateKeyword.NEXTBUS:
        // Next Business Day
        return ok(targetMarketAccess.businessDay(targetDate, factorIndex));
      case VariableDateKeyword.NEXTDAY:
        // Next Day
        return ok(addDays(targetDate, factorIndex));
      case VariableDateKeyword.PREVBUS:
        // Previous Business Day
        return ok(
          targetMarketAccess.businessDay(targetDate, -factorIndex)
        );
      case VariableDateKeyword.PREVDAY:
        // Previous Day
        return ok(subDays(targetDate, factorIndex));
      case VariableDateKeyword.EOY:
        // End of Year
        const nextYear = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
        return ok(subDays(nextYear, factorIndex));
      case VariableDateKeyword.BEOY:
        // Business Day of End of Year
        const nextYear2 = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
        return ok(targetMarketAccess.businessDay(nextYear2, -factorIndex));
      case VariableDateKeyword.BBOY:
        // Business Day Of Beginning of Year
        const thisYear = createDateOnly(targetDate.getFullYear(), 1, 1);
        return ok(
          targetMarketAccess.businessDay(
            thisYear,
            factorIndex - (targetMarketAccess.isBusinessDay(thisYear) ? 1 : 0)
          )
        );
      case VariableDateKeyword.BOY:
        // Beginning of Year
        const thisYear2 = createDateOnly(targetDate.getFullYear(), 1, 1);
        return ok(addDays(thisYear2, factorIndex - 1));
      default:
        return err(new ParseError(
          `${dateParameter} is not supported`
        ));
    }
  }
  #initialTranslateContext(): TranslateContext {
    return {
      state: { kind: 'Normal' },
      factorIndex: 1,
      variableType: VariableType.Date,
      marketAccess: this.#marketAccess,
      output: [],
    };
  }
  // #handlePart(
  //   ctx: TranslateContext,
  //   part: string,
  //   targetDate: Date
  // ): ResultAsync<TranslateContext, ParseError> {

  //   /* number */
  //   if (!isNaN(parseInt(part))) {
  //     return okAsync({
  //       ...ctx,
  //       factorIndex: parseInt(part),
  //     });
  //   }

  //   /* market */
  //   if (this.__supportedMarkets.includes(part)) {
  //     return MarketDateAccess.getMarketAccess(part).mapErr(
  //       (e) => new ParseError(`Fail to retrieve market data ${part}`, e)
  //     ).map((access) => ({
  //       ...ctx,
  //       marketAccess: access,
  //     }));
  //   }

  //   /* date keyword */
  //   if (part in VariableDateKeyword) {
  //     return result2Async(
  //       this.#translateDate(
  //         ctx.marketAccess,
  //         targetDate,
  //         part,
  //         ctx.factorIndex
  //       )
  //     ).map((date) => ({
  //       ...ctx,
  //       date,
  //     }));
  //   }

  //   /* variable switch */
  //   switch (part) {
  //     case 'PARAMMASTER':
  //       return okAsync({ ...ctx, variableType: VariableType.ParamMaster });
  //     case 'PARAMDICTIONARY':
  //       return okAsync({
  //         ...ctx,
  //         variableType: VariableType.ParamMasterStringDictionary,
  //       });
  //     case 'ARGUMENT':
  //       return okAsync({ ...ctx, variableType: VariableType.Argument });
  //     case 'ATTACHMENTFILE':
  //       return okAsync({ ...ctx, variableType: VariableType.ArgumentFile });
  //   }

  //   /* render */
  //   return this.#render(ctx, part);
  // }
  // #render(
  //   ctx: TranslateContext,
  //   part: string
  // ): ResultAsync<TranslateContext, ParseError> {

  //   switch (ctx.variableType) {
  //     case VariableType.Date:
  //       if (!ctx.date) {
  //         return errAsync(
  //           new ParseError(`Invalid Keyword Setting for date`)
  //         );
  //       }
  //       return okAsync({
  //         ...ctx,
  //         output: [...ctx.output, format(ctx.date, part)],
  //       });

  //     case VariableType.ParamMaster:
  //     case VariableType.ParamMasterStringDictionary:
  //       return okAsync({
  //         ...ctx,
  //         output: [...ctx.output, ''],
  //       });

  //     case VariableType.Argument:
  //       return okAsync({
  //         ...ctx,
  //         output: [...ctx.output, String(arguments[ctx.factorIndex - 1])],
  //       });

  //     case VariableType.ArgumentFile:
  //       return okAsync(ctx);
  //   }
  // }
 #handlePart(
    ctx: TranslateContext,
    part: string,
    targetDate: Date
  ): ResultAsync<TranslateContext, ParseError> {

    /* number */
    if (!isNaN(Number(part))) {
      return okAsync({
        ...ctx,
        factorIndex: Number(part),
      });
    }

    /* market */
    if (this.__supportedMarkets.includes(part)) {
      return MarketDateAccess.getMarketAccess(part)
        .mapErr(e => new ParseError(`Fail to retrieve market data ${part}`, e))
        .map(access => ({
          ...ctx,
          marketAccess: access,
        }));
    }

    /* date keyword (TODAY, YESTERDAY, etc) */
    if (part in VariableDateKeyword) {
      if(ctx.state.kind === 'DatePending') {
        return errAsync(
          new ParseError(`Date keyword repeated before format: ${part}`)
        );
      }
      return result2Async(
        this.#translateDate(
          ctx.marketAccess,
          targetDate,
          part,
          ctx.factorIndex
        )
      ).map(date => ({
        ...ctx,
        state: { kind: 'DatePending', date },
      }));
    }



    /* variable switch */
    switch (part) {
      case 'PARAMMASTER':
        return okAsync({ ...ctx, variableType: VariableType.ParamMaster });

      case 'PARAMDICTIONARY':
        return okAsync({
          ...ctx,
          variableType: VariableType.ParamMasterStringDictionary,
        });

      case 'ARGUMENT':
        return okAsync({ ...ctx, variableType: VariableType.Argument });

      case 'ATTACHMENTFILE':
        return okAsync({ ...ctx, variableType: VariableType.ArgumentFile });
    }

    /* render */
    return this.#render(ctx, part, targetDate);
  }

  #render(
    ctx: TranslateContext,
    part: string,
    targetDate: Date
  ): ResultAsync<TranslateContext, ParseError> {

    if(ctx.state.kind === 'DatePending') {
      const formatted = format(ctx.state.date, part);

      return okAsync({
        state: { kind: 'Normal' },
        factorIndex: ctx.factorIndex,
        variableType: VariableType.Date,
        marketAccess: ctx.marketAccess,
        output: [...ctx.output, formatted],
      });
    }
    switch (ctx.variableType) {
      case VariableType.Date: {
        const dateResult = this.#translateDate(
          ctx.marketAccess,
          targetDate,
          VariableDateKeyword.TODAY, // ← 直前状態から決まるなら state 化
          ctx.factorIndex
        );

        if (dateResult.isErr()) {
          return errAsync(dateResult.error);
        }

        const formatted = format(dateResult.value, part);

        return okAsync({
          ...ctx,
          output: [...ctx.output, formatted],
        });
      }

      case VariableType.Argument:
        return okAsync({
          ...ctx,
          output: [...ctx.output, arguments[ctx.factorIndex - 1]],
        });

      case VariableType.ParamMaster:
      case VariableType.ParamMasterStringDictionary:
        return okAsync({
          ...ctx,
          output: [...ctx.output, ''],
        });

      default:
        return errAsync(
          new ParseError(`Unsupported variable type: ${ctx.variableType}`)
        );
    }
  }

  #translate(keyword: string, targetDate: Date): ResultAsync<string, ParseError> {
    const parts = keyword.split('$');
    const initial: ResultAsync<TranslateContext, ParseError> =
      okAsync(this.#initialTranslateContext());
    return parts
      .reduce(
        (ctxR, part) =>
          ctxR.andThen((ctx) =>
            this.#handlePart(ctx, part, targetDate)
          ),
        initial
      )
      .map((ctx) => ctx.output.join(''));
  }

  #getSupportedMarket() {
    // const distinctMarkets = await prisma.gyomu_market_holiday.findMany({
    //   select: { market: true },
    //   distinct: ['market'],
    // });
    // const markets = new Array<string>();
    // for (var row of distinctMarkets) {
    //   markets.push(row.market);
    // }
    // return markets;
    return genericDBFunction<{ market: string }[]>(
      'load distinct markets',
      () =>
        prisma.gyomu_market_holiday.findMany({
          select: { market: true },
          distinct: ['market'],
        }),
      []
    ).map(rows => rows.map(r => r.market));
  }
}