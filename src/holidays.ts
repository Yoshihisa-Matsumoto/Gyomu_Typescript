export class MarketDateAccess {
  static #marketHolidays: {
    [market: string]: Date[];
  } = {};

  #market: string;
  #holidays: Date[];
  constructor(market: string) {
    this.#market = market;
    if (market in MarketDateAccess.#marketHolidays) {
      this.#holidays = MarketDateAccess.#marketHolidays[market];
      return;
    }
    this.#holidays = new Array<Date>();
  }
}
