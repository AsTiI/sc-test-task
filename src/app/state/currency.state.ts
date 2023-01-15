import { UpdateDate, SetInitialValues, UpdateValues, UpdateCurrency, SwapCurrencies } from './currency.actions'
import { Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { CurrencyStateModel,  Currency, CurrencyDescription, CurrencyValues, LocalStorage, CurrencyResponceApiModel } from './currency.model';
import { Selector } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';

const currenciesApiKey = '135cf9bf129e0a9aed44050143e2d36d2f3ba2b2';
const currencyApiUrl = 'https://api.getgeoapi.com/v2/currency/historical/';

@State<CurrencyStateModel>({
  name: 'currency',
  defaults:{
    date: '2022-11-08',
    leftSideCurrency: {
      description: {
        abbr: 'USD',
        fullName: 'United States Dollar',
      },
      values: {
        rates: 1.0000,
        count: 1.00,
      }
    },
    rightSideCurrency: {
      description: {
        abbr: 'PLN',
        fullName: 'Polish zloty',
      },
      values: {
        rates: 4.7608,
        count: 4.76,
      }
    },
    currenciesList: [],
    popularCurrencies: {
      leftSideCurrency: [{
        abbr: 'USD',
        fullName: 'United States Dollar',
      },{
        abbr: 'EUR',
        fullName: 'Euro',
      },{
        abbr: 'BYN',
        fullName: 'Belarusian Ruble',
      }],
      rightSideCurrency: [{
        abbr: 'PLN',
        fullName: 'Polish zloty',
      },{
        abbr: 'RUB',
        fullName: 'Russian rubl',
      },{
        abbr: 'JPY',
        fullName: 'Japanese yen',
      }]
    }
  },
})

@Injectable()
export class CurrencyState {

  constructor(private httpClient: HttpClient) {
  }

  updateLocalStorage(popularCurrencies: LocalStorage){
    localStorage.setItem('popularCurrencies', JSON.stringify(popularCurrencies))
  }

  curryCurrencyApiUrl(curryFunc: Function){
    return function(date: string) {
      return function(convertFrom: string, convertTo: string) {
        return curryFunc(date, convertFrom, convertTo);
      };
    };
  }

  getCurrencyApiUrl(date: string, convertFrom: string, convertTo: string){
    return `${ currencyApiUrl }${ date }?api_key=${ currenciesApiKey }&from=${ convertFrom }&to=${ convertTo }&format=json`;
  }

  getCorrectDate(newDate: string = new Date().toString()){
    const date = new Date(newDate);
    const correctDate = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate();
    return correctDate;
  }

  @Action(SetInitialValues)
  setInitialValues(ctx: StateContext<CurrencyStateModel>, httpClient: HttpClient){
    let popularCurrencies: LocalStorage = {
      leftSideCurrency: ctx.getState().popularCurrencies.leftSideCurrency,
      rightSideCurrency: ctx.getState().popularCurrencies.rightSideCurrency
    }
    const localStorageData = localStorage.getItem('popularCurrencies');
    !localStorageData ? this.updateLocalStorage( popularCurrencies ) : popularCurrencies = JSON.parse( localStorageData );

    const rateDate = this.getCorrectDate();

    const currenciesUrl = `${ currencyApiUrl }${ rateDate }?api_key=${ currenciesApiKey }&format=json`;
    this.httpClient.get<CurrencyResponceApiModel>(currenciesUrl).subscribe((res: CurrencyResponceApiModel) => {
      ctx.setState(state => ({
        ...state,
        currenciesList: Object.keys(res.rates).map(el => {
          return {
            abbr: el,
            fullName: res.rates[el].currency_name
          };
        }),
      }))
    })

    const ratesUrl = this.getCurrencyApiUrl(rateDate, popularCurrencies.leftSideCurrency[0].abbr, popularCurrencies.rightSideCurrency[0].abbr)
    this.httpClient.get<CurrencyResponceApiModel>(ratesUrl).subscribe((res: CurrencyResponceApiModel) => {
      const state = ctx.getState();
      ctx.setState({
        ...state,
        date: rateDate,
        leftSideCurrency: {
          description: popularCurrencies.leftSideCurrency[0],
          values: {
            rates: +res.amount,
            count: +(parseFloat(res.amount).toFixed(2)),
          }
        },
        rightSideCurrency: {
          description: popularCurrencies.rightSideCurrency[0],
          values: {
            rates: +res.rates[popularCurrencies.rightSideCurrency[0].abbr].rate,
            count: +(parseFloat(res.rates[popularCurrencies.rightSideCurrency[0].abbr].rate_for_amount).toFixed(2)),
          }
        },
        popularCurrencies: popularCurrencies,
      })
    })
  }

  @Action(SwapCurrencies)
  swapCurrencies(ctx: StateContext<CurrencyStateModel>) {
    const state: CurrencyStateModel = ctx.getState()
    ctx.setState((state: CurrencyStateModel) => {
      this.updateLocalStorage({ leftSideCurrency: state.popularCurrencies.leftSideCurrency, rightSideCurrency: state.popularCurrencies.rightSideCurrency })
      return ({
        ...state,
        leftSideCurrency: {
          description: state.rightSideCurrency.description,
          values: state.leftSideCurrency.values,
        },
        rightSideCurrency: {
          description: state.leftSideCurrency.description,
          values: {
            rates: state.leftSideCurrency.values.rates / state.rightSideCurrency.values.rates,
            count: +((state.leftSideCurrency.values.rates / state.rightSideCurrency.values.rates).toFixed(2)),
          }
        },
        popularCurrencies: {
          leftSideCurrency: state.popularCurrencies.rightSideCurrency,
          rightSideCurrency: state.popularCurrencies.leftSideCurrency,
        },
      })})
  }

  @Action(UpdateDate)
  updateDate(ctx: StateContext<CurrencyStateModel>, action: UpdateDate, httpClient: HttpClient) {
    const state = ctx.getState();
    const rateDate = this.getCorrectDate(action.payload)
    const ratesUrl = this.getCurrencyApiUrl(rateDate, state.leftSideCurrency.description.abbr, state.rightSideCurrency.description.abbr)
    this.httpClient.get<CurrencyResponceApiModel>(ratesUrl).subscribe((res: CurrencyResponceApiModel) => {
      ctx.setState({
        ...state,
        date: action.payload,
        rightSideCurrency: {
          description: state.rightSideCurrency.description,
          values: {
            rates: +res.rates[state.rightSideCurrency.description.abbr].rate,
            count: +((state.leftSideCurrency.values.count * +res.rates[state.rightSideCurrency.description.abbr].rate).toFixed(2)),
          }
        },
      })
    })
  }

  @Action(UpdateValues)
  updateValues(ctx: StateContext<CurrencyStateModel>, action: UpdateValues) {
    const state = ctx.getState()
    ctx.setState({
      ...state,
      leftSideCurrency: {
        description: state.leftSideCurrency.description,
        values: {
          rates: state.leftSideCurrency.values.rates,
          count: action.payload.abbr == state.leftSideCurrency.description.abbr ? +(action.payload.count.toFixed(2)) : +((action.payload.count / state.rightSideCurrency.values.rates).toFixed(2)),
        }
      },
      rightSideCurrency: {
        description: state.rightSideCurrency.description,
        values: {
          rates:  state.rightSideCurrency.values.rates,
          count: action.payload.abbr == state.rightSideCurrency.description.abbr ? +(action.payload.count.toFixed(2)) : +((action.payload.count * state.rightSideCurrency.values.rates).toFixed(2)),
        },
      },
    })
  }

  @Action(UpdateCurrency)
  updateCurrency(ctx: StateContext<CurrencyStateModel>, action: UpdateCurrency) {
    const state = ctx.getState();
    let ratesUrl: string = action.previousCode == state.leftSideCurrency.description.abbr?
      this.getCurrencyApiUrl(state.date, action.payload.abbr, state.rightSideCurrency.description.abbr):
      this.getCurrencyApiUrl(state.date, state.leftSideCurrency.description.abbr, action.payload.abbr);

    let popularCurrencies: LocalStorage = {
      leftSideCurrency: [],
      rightSideCurrency: [],
    };

    this.httpClient.get<CurrencyResponceApiModel>(ratesUrl).subscribe((res: CurrencyResponceApiModel) => {
      if (state.leftSideCurrency.description.abbr == action.previousCode) {
        for(let key in state.popularCurrencies.leftSideCurrency){
          popularCurrencies.leftSideCurrency.push(state.popularCurrencies.leftSideCurrency[key])
        }
        popularCurrencies.leftSideCurrency.unshift(action.payload)

        for(let i = 1; i < popularCurrencies.leftSideCurrency.length; i++){
          if(popularCurrencies.leftSideCurrency[0] == popularCurrencies.leftSideCurrency[i]){
            popularCurrencies.leftSideCurrency.splice(i,1);
            break;
          }
        }
        popularCurrencies.leftSideCurrency.splice(3);
        popularCurrencies.rightSideCurrency = ctx.getState().popularCurrencies.rightSideCurrency;
        ctx.setState({
          ...state,
          leftSideCurrency: {
            description: {
              abbr: action.payload.abbr,
              fullName: action.payload.fullName,
            },
            values: state.leftSideCurrency.values,
          },
          rightSideCurrency: {
            description: state.rightSideCurrency.description,
            values: {
              rates: +res.rates[state.rightSideCurrency.description.abbr].rate,
              count: +(state.leftSideCurrency.values.count * +res.rates[state.rightSideCurrency.description.abbr].rate).toFixed(2),
            },
          },
          popularCurrencies: popularCurrencies,
        })
        this.updateLocalStorage(popularCurrencies)
      } else {
        for(let key in state.popularCurrencies.rightSideCurrency){
          popularCurrencies.rightSideCurrency.push(state.popularCurrencies.rightSideCurrency[key])
        }
        popularCurrencies.rightSideCurrency.unshift(action.payload);
        for(let i = 1; i < popularCurrencies.rightSideCurrency.length; i++){
          if(popularCurrencies.rightSideCurrency[0] == popularCurrencies.rightSideCurrency[i]){
            popularCurrencies.rightSideCurrency.splice(i,1);
            break;
          }
        }
        popularCurrencies.rightSideCurrency.splice(3);
        popularCurrencies.leftSideCurrency = ctx.getState().popularCurrencies.leftSideCurrency;

        ctx.setState({
          ...state,
          rightSideCurrency: {
            description: {
              abbr: action.payload.abbr,
              fullName: action.payload.fullName,
            },
            values: {
              rates: +res.rates[action.payload.abbr].rate,
              count: +(state.leftSideCurrency.values.count * +res.rates[action.payload.abbr].rate).toFixed(2),
            },
          },
          popularCurrencies: popularCurrencies,
        })

        this.updateLocalStorage(popularCurrencies)
      }
    })
  }

  @Selector()
  static currency(state: CurrencyStateModel) {
    return state;
  }

  @Selector()
  static values(state: CurrencyStateModel) {
    return { leftSideCurrency: state.leftSideCurrency, rightSideCurrency: state.rightSideCurrency }
  }

  @Selector()
  static sideCurrencyValues(state: CurrencyStateModel) {
    return {
      leftSideCurrency: {
        description: state.leftSideCurrency.description,
        values: state.leftSideCurrency.values,
        popularCurrencies: state.popularCurrencies.leftSideCurrency,
      },
      rightSideCurrency: {
        description: state.rightSideCurrency.description,
        values: state.rightSideCurrency.values,
        popularCurrencies: state.popularCurrencies.rightSideCurrency,
      }
    }
  }
}
