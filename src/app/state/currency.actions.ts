import { Value, Currency } from './currency.model'

export class SetValues {
  static readonly type = '[Currency] Set values';
  constructor(public payload: Value[]) {
  }
}
export class SetCurrencies {
  static readonly  type = '[Currensies] Set currencies';
  constructor(public payload: Currency[]) {
  }
}

export class SetDate {
  static readonly type = '[Date] Set date';
  constructor(public payload: string) {
  }
}

export class SetDateRate {
  static readonly  type = '[DateRate] Set date rate';
  constructor(public payload: string) {
  }
}
