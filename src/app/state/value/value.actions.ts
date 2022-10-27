import { ValueModel } from './value.model'
export class SetValue {
  static readonly type = '[Value] Set value';
  constructor(public payload: ValueModel[]) {}
}
