export class SetCurrency {
  static readonly type = '[Currency] Set currency';
  constructor(public payload: {code: string, name: string}[]) {
  }
}
