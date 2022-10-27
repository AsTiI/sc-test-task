export interface RatesModel {
  code: string,
  rate: string,
}

export interface RatesDateModel {
  updated_date: string,
  rates: RatesModel[],
}
