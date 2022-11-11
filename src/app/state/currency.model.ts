export interface Currency {
  code: string,
  fullName: string,
}

export interface Value {
  currency: Currency,
  rates: string,
  count: string,
}

export interface CurrencyModel {
  date: string,
  currencies: Currency[],
  values: Value[],
}
