export interface CurrencyStateModel {
  date: string,
  leftSideCurrency: Currency,
  rightSideCurrency: Currency,
  currenciesList: CurrencyDescription[],
  popularCurrencies: LocalStorage,
}

export interface Currency {
  description: CurrencyDescription,
  values: CurrencyValues,
}

export interface CurrencyDescription {
  abbr: string,
  fullName: string,
}

export interface CurrencyValues {
  rates: number,
  count: number,
}

export interface LocalStorage {
  leftSideCurrency: CurrencyDescription[],
  rightSideCurrency: CurrencyDescription[],
}
