import { Component, OnInit, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CurrencyState } from './../../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import {
  SetValues, SetDate, SetCurrencies, SetDateRate
} from './../../../state/currency.actions'

class Rate{
  constructor(
    public code: string,
    public rate: string,
  ) {
  }
}

@Component({
  selector: 'app-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})

export class CurrenciesComponent implements OnInit {

  @Select(CurrencyState.currency) currency$!: Observable<{
    date: string,
    currencies: {
      code: string,
      fullName: string,
    }[],
    values: {
      currency: {
        code: string,
        fullName: string,
      },
      rates: string,
      count: string,
    }[],
  }>;

  private currenciesApiKey = '135cf9bf129e0a9aed44050143e2d36d2f3ba2b2';
  private currenciesUrl = `https://api.getgeoapi.com/v2/currency/list?api_key=${this.currenciesApiKey}&format=json`;

  private currencySubscriptor: Subscription;

  dateValue: string;
  maxDate: string;
  currencies!: {
    date: string,
    currencies: {
      code: string,
      fullName: string,
    }[],
    values: {
      currency: {
        code: string,
        fullName: string,
      },
      rates: string,
      count: string,
    }[],
  };

  constructor(private httpClient: HttpClient, private storeCurrency: Store) {
    this.currencySubscriptor = this.currency$.subscribe((currencies: {
      date: string,
      currencies: {
        code: string,
        fullName: string,
      }[],
      values: {
        currency: {
          code: string,
          fullName: string,
        },
        rates: string,
        count: string,
      }[],
    }) => {
      this.currencies = currencies;
    })

    this.dateValue = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate();
    this.maxDate = this.getDate();
  }

  ngOnInit(): void {
    this.getCurrenciesFromApi()
  }

  ngOnDestroy(): void {
    this.currencySubscriptor.unsubscribe();
  }

  getDate(): string{
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if(dd < 10){
      dd = parseInt('0' + dd.toString())
    }
    if(mm < 10){
      mm = parseInt('0' + mm.toString())
    }
    return yyyy.toString() + '-' + mm.toString() + '-' + dd.toString()
  }
  updateDate(value: string){
    let date = new Date(value)
    let rateDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();

    let ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${rateDate}?api_key=${this.currenciesApiKey}&from=${this.currencies.values[0].currency.code}&to=${this.currencies.values[1].currency.code}&format=json`;
    let promise = new Promise((resolve,reject) => {
      this.httpClient.get(ratesUrl)
        .toPromise()
        .then((res: any) => {
          this.storeCurrency.dispatch(new SetDate(rateDate))
          this.storeCurrency.dispatch(new SetDateRate(res['rates'][this.currencies.values[1].currency.code]['rate']))
          resolve(res);
        }, msg => {
          alert('You reached the limit of your currency requests for the day');
        })
    })
  }

  getCurrenciesFromApi(){
    let promise = new Promise((resolve, reject) => {
      this.httpClient.get(this.currenciesUrl)
        .toPromise()
        .then( (res:any) => res['currencies'])
        .then( currenciesObject => {
            this.storeCurrency.dispatch(new SetCurrencies(Object.keys(currenciesObject).map(key => {
              return {code: key, fullName: currenciesObject[key]}
            })))
            resolve(currenciesObject);
          },
          msg => {
            reject()
          })
    })
  }
}
