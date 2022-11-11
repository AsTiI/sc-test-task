import { SetValues, SetDate, SetCurrencies, SetDateRate } from './currency.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { CurrencyModel, Value } from './currency.model';
import { Selector } from '@ngxs/store';


@State<CurrencyModel>({
  name: 'currencies',
  defaults:{
    date: '2022-11-08',
    currencies: [],
    values: [{
      currency: {
        code: 'USD',
        fullName: 'United State Dollar',
      },
      rates: '1.0000',
      count: '0.00',
    }, {
      currency: {
        code: 'EUR',
        fullName: 'Euro',
      },
      rates: '0.9900',
      count: '0.00',
    }],
  },
})

@Injectable()
export class CurrencyState {

  @Action(SetDate)
  setDate(ctx: StateContext<CurrencyModel>, action: SetDate) {
    ctx.setState((state) => ({
      ...state,
      date: action.payload,
      })
    )
  }
  @Action(SetCurrencies)
  setCurrencies(ctx: StateContext<CurrencyModel>, action: SetCurrencies) {
    ctx.setState((state) => ({
      ...state,
      currencies: action.payload,
    }))
  }

  @Action(SetValues)
  setValues(ctx: StateContext<CurrencyModel>, action: SetValues) {
    ctx.setState((state) => ({
      ...state,
      values: action.payload,
    }))
  }
  @Action(SetDateRate)
  setDateRate(ctx: StateContext<CurrencyModel> , action: SetDateRate) {
    ctx.setState((state) => ({
      ...state,
      values: [{
        ...state.values[0],
      },{
        ...state.values[1],
        rates: action.payload,
        count: (parseFloat(state.values[1].count) / parseFloat(state.values[1].rates) * parseFloat(action.payload)).toFixed(2).toString(),
      }],
    }))
  }

  @Selector()
  static date(state: CurrencyModel) {
    return state.date;
  }
  @Selector()
  static currency(state: CurrencyModel) {
    return state;
  }
  @Selector()
  static values(state: CurrencyModel) {
    return state.values
  }
}
