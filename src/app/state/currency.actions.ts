import { Currency, CurrencyDescription } from './currency.model'

export class UpdateDate {
  static readonly type = '[Date] Update date';
  constructor(public payload: string) {
  }
}

export class SetInitialValues {
  static readonly type = '[InitialValues] Set initial values';
  constructor() {
  }
}
export class UpdateValues {
  static readonly type = '[UpdateValues] Update values';
  constructor(public payload: { abbr: string, count: number }) {
  }
}
export class UpdateCurrency {
  static readonly type = '[UpdateCurrency] Update currency';
  constructor(public payload: CurrencyDescription, public previousCode: string) {
  }
}
export  class SwapCurrencies {
  static readonly type = '[SwapCurrencies] Swap currencies';
  constructor() {
  }
}
