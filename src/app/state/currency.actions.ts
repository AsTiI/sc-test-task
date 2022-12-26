import { Value, Currency } from './currency.model'

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
  constructor(public payload: [code: string, value: string]) {
  }
}
export class UpdateCurrency {
  static readonly type = '[UpdateCurrency] Update currency';
  constructor(public payload: Currency, public previousCode: string) {
  }
}
export  class SwapCurrencies {
  static readonly type = '[SwapCurrencies] Swap currencies';;
  constructor() {
  }
}
