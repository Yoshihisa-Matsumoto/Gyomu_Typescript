import { isNumberObject } from 'util/types';
import { createDateOnly } from './dateOperation';
import prisma, { Context } from './dbsingleton';
import MarketDateAccess from './holidays';
import { addDays, addMonths, format, subDays } from 'date-fns';
import { DBError, ParseError } from './errors';
import {
  PromiseResult,
  success,
  fail,
  Failure,
  promiseFail,
  promiseSuccess,
  Result,
} from './result';
import { Parse } from 'unzipper';

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

export class VariableTranslator {
  readonly #marketAccess: MarketDateAccess;
  __supportedMarkets: string[] = new Array<string>();
  //readonly #ctx: Context;
  private constructor(marketAccess: MarketDateAccess) {
    //constructor(marketAccess: MarketDateAccess, ctx: Context) {
    this.#marketAccess = marketAccess;
    //this.#ctx = ctx;
  }
  static async getTranslator(
    market: string
  ): PromiseResult<VariableTranslator, DBError> {
    const result = await MarketDateAccess.getMarketAccess(market);
    if (result.isFailure()) return result;
    const access = result.value;
    const translator = new VariableTranslator(access);
    await translator.init();
    return success(translator);
  }

  async init() {
    this.__supportedMarkets = await this.#getSupportedMarket();
  }
  async parse(
    inputString: string,
    targetDate: Date
  ): PromiseResult<string, ParseError> {
    const startIndex = inputString.indexOf('{%');
    const endIndex = inputString.indexOf('%}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const prefix = inputString.substring(0, startIndex);
      const keyword = inputString.substring(startIndex + 2, endIndex);
      const suffix = inputString.substring(endIndex + 2);
      const result = await this.#translate(keyword, targetDate);
      if (result.isFailure()) return result;
      const parsedString = prefix + result.value + suffix;
      return await this.parse(parsedString, targetDate);
    } else return success(inputString);
    // return new Promise((resolve, reject) => {
    //   resolve(success(inputString));
    // });
  }

  async parseDate(
    keyword: string,
    targetDate: Date
  ): PromiseResult<Date, ParseError> {
    const parts = keyword.split('$');
    let factorIndex = 1;

    let translateMarketAccess = this.#marketAccess;

    // const supportedMarket = await this.#getSupportedMarket();

    for (var item of parts) {
      if (!isNaN(parseInt(item))) {
        factorIndex = parseInt(item);
      } else if (this.__supportedMarkets.includes(item)) {
        const result = await MarketDateAccess.getMarketAccess(item);
        if (result.isFailure())
          return new Failure(
            new ParseError(`Fail to retrieve market data ${item}`, result.error)
          );
        translateMarketAccess = result.value;
      } else if (item in VariableDateKeyword) {
        return this.#translateDate(
          translateMarketAccess,
          targetDate,
          item,
          factorIndex
        );
      }
    }
    return promiseFail<Date, ParseError>(
      'No keyword: Not supported',
      ParseError
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
        return success(targetDate);
      case VariableDateKeyword.BBOM:
        // Business Day of Beginning of Month
        return success(
          targetMarketAccess.businessDayOfBeginningMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.NEXTBBOM:
        // Business Day of Beginning of Next Month
        return success(
          targetMarketAccess.businessDayOfBeginningOfNextMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.BOM:
        // Beginning of Month
        return success(
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
        return success(
          targetMarketAccess.businessDayOfEndMonthWithOffset(
            targetDate,
            factorIndex
          )
        );
      case VariableDateKeyword.NEXTBEOM:
        // Business Day of End of Next Month
        const twoMonthAfter = addMonths(targetDate, 2);
        return success(
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
        return success(targetMarketAccess.businessDay(bom, -factorIndex));
      case VariableDateKeyword.EOM:
        // End Of Month
        const nextMonth = addMonths(targetDate, 1);
        return success(
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
        return success(targetMarketAccess.businessDay(targetDate, factorIndex));
      case VariableDateKeyword.NEXTDAY:
        // Next Day
        return success(addDays(targetDate, factorIndex));
      case VariableDateKeyword.PREVBUS:
        // Previous Business Day
        return success(
          targetMarketAccess.businessDay(targetDate, -factorIndex)
        );
      case VariableDateKeyword.PREVDAY:
        // Previous Day
        return success(subDays(targetDate, factorIndex));
      case VariableDateKeyword.EOY:
        // End of Year
        const nextYear = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
        return success(subDays(nextYear, factorIndex));
      case VariableDateKeyword.BEOY:
        // Business Day of End of Year
        const nextYear2 = createDateOnly(targetDate.getFullYear() + 1, 1, 1);
        return success(targetMarketAccess.businessDay(nextYear2, -factorIndex));
      case VariableDateKeyword.BBOY:
        // Business Day Of Beginning of Year
        const thisYear = createDateOnly(targetDate.getFullYear(), 1, 1);
        return success(
          targetMarketAccess.businessDay(
            thisYear,
            factorIndex - (targetMarketAccess.isBusinessDay(thisYear) ? 1 : 0)
          )
        );
      case VariableDateKeyword.BOY:
        // Beginning of Year
        const thisYear2 = createDateOnly(targetDate.getFullYear(), 1, 1);
        return success(addDays(thisYear2, factorIndex - 1));
      default:
        return fail<ParseError>(
          `${dateParameter} is not supported`,
          ParseError
        );
    }
  }
  async #translate(keyword: string, targetDate: Date) {
    const parts = keyword.split('$');
    let factorIndex = 1;
    let variableType: VariableType = VariableType.Date;
    let translateMarketAccess = this.#marketAccess;
    //const supportedMarket = await this.#getSupportedMarket();
    const stringList = new Array<string>();
    let dateParameter: Result<Date, ParseError> = fail('init', ParseError);
    // console.log('keyword', keyword);
    // console.log('parts', parts);
    for (var item of parts) {
      if (!isNaN(parseInt(item))) {
        factorIndex = parseInt(item);
      } else if (this.__supportedMarkets.includes(item)) {
        // console.log('Market', item);
        const result = await MarketDateAccess.getMarketAccess(item);
        if (result.isFailure())
          return new Failure(
            new ParseError(`Fail to retrieve market data ${item}`, result.error)
          );
        translateMarketAccess = result.value;
      } else if (item in VariableDateKeyword) {
        // console.log('internal keyword', item);
        dateParameter = await this.#translateDate(
          translateMarketAccess,
          targetDate,
          item,
          factorIndex
        );
        if (dateParameter.isFailure()) return dateParameter;
        // console.log('parse date', dateParameter);
      } else {
        switch (item) {
          case 'PARAMMASTER':
            // Retrieve from DB Parameter
            variableType = VariableType.ParamMaster;
            break;
          case 'PARAMDICTIONARY':
            variableType = VariableType.ParamMasterStringDictionary;
            break;
          case 'ARGUMENT':
            variableType = VariableType.Argument;
            break;
          case 'ATTACHMENTFILE':
            variableType = VariableType.ArgumentFile;
            break;
          default:
            switch (variableType) {
              case VariableType.Date:
                const translateFormat = item;
                if (!dateParameter || dateParameter.isFailure())
                  return fail<ParseError>(
                    `Invalid Keyword Setting for date: ${keyword}`,
                    ParseError
                  );
                // console.log('format', item, dateParameter);
                if (dateParameter.isFailure()) return dateParameter;
                // console.log(
                //   'formated date',
                //   format(dateParameter.value, translateFormat)
                // );
                stringList.push(format(dateParameter.value, translateFormat));
                break;
              case VariableType.ParamMaster:
                stringList.push('');
                break;
              case VariableType.ParamMasterStringDictionary:
                stringList.push('');
                break;
              case VariableType.Argument:
                stringList.push(arguments[factorIndex - 1]);
                break;
              case VariableType.ArgumentFile:
                break;
            }
        }
      }
    }
    parts.forEach(async (item) => {});
    //console.log('parsed result', stringList);
    return success(stringList.join(''));
  }

  async #getSupportedMarket() {
    const distinctMarkets = await prisma.gyomu_market_holiday.findMany({
      select: { market: true },
      distinct: ['market'],
    });
    const markets = new Array<string>();
    for (var row of distinctMarkets) {
      markets.push(row.market);
    }
    return markets;
  }
}
