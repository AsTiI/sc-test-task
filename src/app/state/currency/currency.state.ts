import { SetCurrency } from './../currency/currency.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { CurrenciesModel} from './../currency/currency.model';
import { Selector } from '@ngxs/store';

@State<CurrenciesModel>({
  name: 'currencies',
  defaults:{
    currencies: [],
  }
})

@Injectable()
export class CurrencyState {

  @Action(SetCurrency)
  setCurrency(ctx: StateContext<CurrenciesModel>, action: SetCurrency) {
    ctx.setState((state) => ({
      ...state,
      currencies: action.payload
      })
    )

  }

  @Selector()
  static currencies(state: CurrenciesModel) {
    let currenciesArr: {}[] = [];
    for(let item in state.currencies){
      currenciesArr.push({code: state.currencies[item].code, name: state.currencies[item].name})
    }

    return currenciesArr;
  }
}
