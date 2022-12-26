import { UpdateDate, SetInitialValues, UpdateValues, UpdateCurrency, SwapCurrencies } from './currency.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { CurrencyModel, Value, Currency } from './currency.model';
import { Selector } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';

@State<CurrencyModel>({
  name: 'currencies',
  defaults:{
    date: '2022-11-08',
    currencies: [],
    values: [
      {
        currency: {
          code: 'EUR',
          fullName: 'Euro',
        },
        rates: '1.0000',
        count:  '1.00',
        popularCurrencies: [
          {
            code: 'EUR',
            fullName: 'Euro'
          },
          {
            code: 'USD',
            fullName: 'United State Dollar'
          },
          {
            code: 'BYN',
            fullName: 'Belarusian Ruble'
          }],
      },
      {
        currency: {
          code: 'USD',
          fullName: 'United States Dollar',
        },
        rates: '1.0600',
        count: '1.06',
        popularCurrencies: [{
          code: 'USD',
          fullName: 'United States Dollar'
        },{
          code: 'EUR',
          fullName: 'Euro'
        },{
          code: 'BYN',
          fullName: 'Belarusian Ruble'
        }],
      }],
  },
})

@Injectable()
export class CurrencyState {
  private currenciesApiKey = '135cf9bf129e0a9aed44050143e2d36d2f3ba2b2';

  constructor(private httpClient: HttpClient) {
  }

  updateLocalStorage(popularCurrencies: Currency[][]){
    localStorage.setItem('popularCurrencies', JSON.stringify([popularCurrencies[0], popularCurrencies[1]]))
  }

  @Action(SetInitialValues)
  setInitialValues(ctx: StateContext<CurrencyModel>, httpClient: HttpClient){
    let popularCurrencies: Currency[][] = [ctx.getState().values[0].popularCurrencies, ctx.getState().values[1].popularCurrencies];
    const localStorageState = localStorage.getItem('popularCurrencies');
    !localStorageState ? this.updateLocalStorage( popularCurrencies ) : popularCurrencies = JSON.parse( localStorageState );
    const date = new Date();
    const rateDate = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate();
    const currenciesUrl = `https://api.getgeoapi.com/v2/currency/historical/${ rateDate }?api_key=${ this.currenciesApiKey }&format=json`;
    this.httpClient.get(currenciesUrl).subscribe((res: any) => {
      ctx.setState(state => ({
        ...state,
        currencies: Object.keys(res['rates']).map(el => {
          return {code: el, fullName: res['rates'][el]['currency_name']};
        }),
      }))
    })
    const ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${ rateDate }?api_key=${ this.currenciesApiKey }&from=${ popularCurrencies[0][0].code }&to=${ popularCurrencies[1][0].code }&format=json`;
    this.httpClient.get(ratesUrl).subscribe((res: any) => {
      const state = ctx.getState();
      ctx.setState({
        ...state,
        date: rateDate,
        values: [{
          currency: {
            code: res['base_currency_code'],
            fullName: res['base_currency_name'],
          },
          rates: res['amount'],
          count: parseFloat(res['amount']).toFixed(2).toString(),
          popularCurrencies: popularCurrencies[0],
        },
          {
            currency: {
              code: popularCurrencies[1][0].code,
              fullName: res['rates'][popularCurrencies[1][0].code]['currency_name'],
            },
            rates: res['rates'][popularCurrencies[1][0].code]['rate'],
            count: parseFloat(res['rates'][popularCurrencies[1][0].code]['rate_for_amount']).toFixed(2).toString(),
            popularCurrencies: popularCurrencies[1],
          }]
      })
    })

  }

  @Action(SwapCurrencies)
  swapCurrencies(ctx: StateContext<CurrencyModel>) {
    ctx.setState(state => {
      this.updateLocalStorage([state.values[1].popularCurrencies, state.values[0].popularCurrencies])
      return ({
        ...state,
        values: [{
          ...state.values[0],
          currency: state.values[1].currency,
          // rates: state.values[0].rates,
          // count: state.values[0].count,
          popularCurrencies: state.values[1].popularCurrencies,
        },
          {
            ...state.values[0],
            currency: state.values[0].currency,
            // rates: state.values[0].rates,
            // count: state.values[0].count,
            rates: ((parseFloat(state.values[0].rates) / parseFloat(state.values[1].rates)).toFixed(4)).toString(),
            count: ((parseFloat(state.values[0].count) / parseFloat(state.values[1].rates)).toFixed(2)).toString(),
            popularCurrencies: state.values[0].popularCurrencies,
          }]
      })})
  }

  @Action(UpdateDate)
  updateDate(ctx: StateContext<CurrencyModel>, action: UpdateDate, httpClient: HttpClient) {
    const state = ctx.getState();
    const date = new Date(action.payload)
    const rateDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    const ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${ rateDate }?api_key=${ this.currenciesApiKey }&from=${ state.values[0].currency.code }&to=${ state.values[1].currency.code }&format=json`;
    this.httpClient.get(ratesUrl).subscribe((res: any) => {
      if(state.values[0].currency.code == res['base_currency_code']){
        ctx.setState({
          ...state,
          date: action.payload,
          values: [{
            currency: state.values[0].currency,
            rates: res['amount'],
            count: state.values[0].count,
            popularCurrencies: state.values[0].popularCurrencies,
          },
            {
              currency: state.values[1].currency,
              rates: res['rates'][state.values[1].currency.code]['rate'],
              count: (parseFloat(state.values[0].count) * parseFloat(res['rates'][state.values[1].currency.code]['rate'])).toFixed(2).toString(),
              popularCurrencies: state.values[1].popularCurrencies,
            }]
        })
      } else {
        if(state.values[0].currency.code == res['base_currency_code']){
          ctx.setState({
            ...state,
            date: action.payload,
            values: [{
              currency: state.values[0].currency,
              rates: res['rates'][state.values[0].currency.code]['rate'],
              count: (parseFloat(state.values[0].count) * parseFloat(res['rates'][state.values[0].currency.code]['rate'])).toFixed(2).toString(),
              popularCurrencies: state.values[0].popularCurrencies,
            },
              {
                currency: state.values[1].currency,
                rates: res['amount'],
                count: state.values[1].count,
                popularCurrencies: state.values[1].popularCurrencies,
              }]
          })
        }
      }
    })
  }

  @Action(UpdateValues)
  updateValues(ctx: StateContext<CurrencyModel>, action: UpdateValues) {
    ctx.setState((state) => ({
      ...state,
      values: [{
        ...state.values[0],
        count: (action.payload[0] == state.values[0].currency.code) ? action.payload[1] : (parseFloat(action.payload[1]) / parseFloat(state.values[1].rates)).toFixed(2).toString(),
      },{
        ...state.values[1],
        count: (action.payload[0] == state.values[1].currency.code) ? action.payload[1] : (parseFloat(action.payload[1]) * parseFloat(state.values[1].rates)).toFixed(2).toString(),
      }]
    }))
  }
  @Action(UpdateCurrency)
  updateCurrency(ctx: StateContext<CurrencyModel>, action: UpdateCurrency) {
    const state = ctx.getState();
    let ratesUrl: string;
    if (action.previousCode == state.values[0].currency.code) {
      ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${ state.date }?api_key=${ this.currenciesApiKey }&from=${ action.payload.code }&to=${ state.values[1].currency.code }&format=json`;
    } else {
      ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${ state.date }?api_key=${ this.currenciesApiKey }&from=${ state.values[0].currency.code }&to=${ action.payload.code }&format=json`;
    }
    let popularCurrencies: Currency[][] = [[],[]];

    this.httpClient.get(ratesUrl).subscribe((res: any) => {
      if (state.values[0].currency.code == action.previousCode) {
        for(let key in state.values[0].popularCurrencies){
          popularCurrencies[0].push(state.values[0].popularCurrencies[key])
        }
        popularCurrencies[0].unshift(action.payload)
        for(let i = 1; i < popularCurrencies[0].length; i++){
          if(popularCurrencies[0][0] == popularCurrencies[0][i]){
            popularCurrencies[0].splice(i,1);
            break;
          }
        }
        popularCurrencies[0].splice(3);
        popularCurrencies[1] = ctx.getState().values[1].popularCurrencies;
        ctx.setState({
          ...state,
          values: [
            {
              ...state.values[0],
              currency: {
                code: action.payload.code,
                fullName: action.payload.fullName,
              },
              popularCurrencies: popularCurrencies[0],
            },
            {
              ...state.values[1],
              rates: res['rates'][state.values[1].currency.code]['rate'],
              count: (parseFloat(state.values[0].count) * parseFloat(res['rates'][state.values[1].currency.code]['rate'])).toFixed(2).toString(),
            }],
        })
        this.updateLocalStorage(popularCurrencies)

      } else {
        for(let key in state.values[1].popularCurrencies){
          popularCurrencies[1].push(state.values[1].popularCurrencies[key])
        }
        popularCurrencies[1].unshift(action.payload);
        for(let i = 1; i < popularCurrencies.length; i++){
          if(popularCurrencies[1][0] == popularCurrencies[1][i]){
            popularCurrencies[1].splice(i,1);
            break;
          }
        }
        popularCurrencies[1].splice(3);
        popularCurrencies[0] = ctx.getState().values[0].popularCurrencies;


        ctx.setState({
          ...state,
          values: [
            {
              ...state.values[0],
            },
            {
              currency: {
                code: action.payload.code,
                fullName: action.payload.fullName,
              },
              rates: res['rates'][action.payload.code]['rate'],
              count: (parseFloat(state.values[0].count) * parseFloat(res['rates'][action.payload.code]['rate'])).toFixed(2).toString(),
              popularCurrencies: popularCurrencies[1],

            }],
        })
      }
      this.updateLocalStorage(popularCurrencies)

    })
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
