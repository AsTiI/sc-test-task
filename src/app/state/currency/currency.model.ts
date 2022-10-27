export interface Currency {
  code: string,
  name: string,
}

export interface CurrenciesModel {
  currencies: Currency[],
}

export interface CurrencyRatesModel {
  code: string,
  name: string,
  amount: number,
  date: Date,
  rates: {

  },
}
