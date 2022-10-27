import { SetValue } from './value.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { ValuesModel} from './value.model';
import { Selector } from '@ngxs/store';

@State<ValuesModel>({
  name: 'values',
  defaults: {
    values: [{
        code: 'EUR',
        value: '0'
    },
      {
        code: 'USD',
        value: '0',
    }]
  },
})
@Injectable()
export class ValueState {

  @Action(SetValue)
  setValue(ctx: StateContext<ValuesModel>, action: SetValue) {
    const state = ctx.getState();
    ctx.setState({
      values: action.payload
    });
  }
  @Selector()
  static value(state: ValuesModel) {
    const valuesArr: {code: string, value: string}[] = [];
    for( let key in state.values){
      valuesArr.push(state.values[key])
    }
    return valuesArr;
  }
  @Selector()
  static currency(state: ValuesModel) {
    return state.values;
  }
}
