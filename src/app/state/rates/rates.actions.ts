import { RatesModel } from './../rates/rates.model';

export class SetRate {
  static readonly type = '[Rates] set rates';
  constructor(public payload: RatesModel[]) {
  }
}

export class UpdateRates {
  static readonly type = '[Rates] update rates';
  constructor(public payload: RatesModel[]) {
  }
}

export class UpdateDate {
  static readonly type = '[Date] update date';
  constructor(public payload: string) {
  }
}
