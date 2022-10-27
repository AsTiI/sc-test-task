import { SetRate, UpdateRates, UpdateDate } from './../rates/rates.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { RatesModel, RatesDateModel } from './../rates/rates.model';
import { Selector } from '@ngxs/store';

@State<RatesDateModel>({
  name: 'rates',
  defaults:{
    updated_date: new Date().toLocaleDateString(),
    rates: [
      {
        code: 'EUR',
        rate: '1',
      },
      {
        code: 'USD',
        rate: '0.98',
      },
    ],
  }
})

@Injectable()
export class RatesState {

  @Action(SetRate)
  setRates(ctx: StateContext<RatesDateModel>, action: SetRate) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      rates: action.payload
    })
  }
  @Action(UpdateRates)
  updateRates(ctx: StateContext<RatesDateModel>, action: UpdateRates) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      rates: action.payload,
    })
  }
  @Action(UpdateDate)
  updateDate(ctx: StateContext<RatesDateModel>, action: UpdateDate){
    const state = ctx.getState();
    ctx.setState({
      ...state,
      updated_date: action.payload,
    })
  }

  @Selector()
  static rates(state: RatesDateModel) {
    let ratesArr: {code: string, rate: string}[] = [];
    for(let key in state.rates){
      ratesArr.push({code: state.rates[key].code, rate: state.rates[key].rate})
    }
    return ratesArr;
  }
  @Selector()
  static ratesData(state: RatesDateModel) {
    let ratesArr: {code: string, rate: string}[] = [];
    for(let key in state.rates){
      ratesArr.push({code: state.rates[key].code, rate: state.rates[key].rate})
    }
    return [state.updated_date, ratesArr];
  }
}
