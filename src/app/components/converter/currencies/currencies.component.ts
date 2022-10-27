import { Component, OnInit, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ValueState } from './../../../state/value/value.state'
import { RatesState } from './../../../state/rates/rates.state'
import { CurrencyState } from './../../../state/currency/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { CurrenciesModel } from './../../../state/currency/currency.model'
import {
  SetCurrency
} from './../../../state/currency/currency.actions'
import {
  SetRate,
  UpdateDate
} from './../../../state/rates/rates.actions'

import {
  SetValue,
} from './../../../state/value/value.actions'

class Currency{
  constructor(
    public code: string,
    public name: string,
  ) {}
}
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
  @Select(CurrencyState.currencies) currencies$!: Observable<{}[]>;
  @Select(RatesState.rates) rates$!: Observable<Rate[]>;
  @Select(RatesState.ratesData) ratesData$!: Observable<string>;
  @Select(ValueState.value) value$!: Observable<{code: string, value: string}[]>;



  private currenciesApiKey = '0e92cb399c53f7f7b25ade450bfec9bead566d36';
  private currenciesUrl = `https://api.getgeoapi.com/v2/currency/list?api_key=${this.currenciesApiKey}&format=json`;
  private ratesSubscription: Subscription;
  private valueSubscription: Subscription;


  dateValue: string;
  maxDate: string;
  currencies: Currency[] = [];
  rates!: Rate[];
  value!: {code: string, value: string}[];
  ratesData!: string;

  constructor(private httpClient: HttpClient, private storeCurrency: Store, private storeRates: Store, private storeValues: Store) {
    this.ratesSubscription = this.rates$.subscribe((value: Rate[]) => {
      this.rates = value;
    })
    this.valueSubscription = this.value$.subscribe((value: {code: string, value: string}[]) => {
      this.value = value;
    });

    this.dateValue = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate();
    this.maxDate = this.getDate();
  }
  ngOnInit(): void {
    this.getCurrenciesFromApi()
    this.setDate(this.getDate())
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();

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
  setDate(value: string){
    let date = new Date(value)
    let rateDate = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
    this.storeRates.dispatch(new UpdateDate(rateDate));
    let ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${rateDate}?api_key=${this.currenciesApiKey}&from=${this.rates[0].code}&to=${this.rates[1].code}&format=json`;
    let promise = new Promise((resolve,reject) => {
      this.httpClient.get(ratesUrl)
        .toPromise()
        .then((res: any) => {
          for(let key in this.rates){
            if(this.rates[key].code == res['base_currency_code']){
              this.rates[key].rate = res['amount'];
            } else {
              this.rates[key].rate = res['rates'][this.rates[1].code]['rate'];
            }
          }
          this.updateRatesAndValues();
          resolve(res);
        }, msg => {
          alert('You reached the limit of your currency requests for the day');
        })
    })
  }
  updateRatesAndValues(){

    this.storeRates.dispatch(new SetRate([{
      code: this.rates[0].code,
      rate: this.rates[0].rate,
    },{
      code: this.rates[1].code,
      rate: this.rates[1].rate,
    }]))
    this.storeValues.dispatch(new SetValue([{
      code: this.value[0].code,
      value: (parseFloat(this.value[0].value) * parseFloat(this.rates[0].rate)).toFixed(2).toString(),
    },
      {
        code: this.value[1].code,
        value: (parseFloat(this.value[0].value) * parseFloat(this.rates[1].rate)).toFixed(2).toString()
      }]))
  }
  setCurrencies(){
    this.storeCurrency.dispatch(new SetCurrency(this.currencies))
  }
  getCurrenciesFromApi(){
    let promise = new Promise((resolve, reject) => {
      this.httpClient.get(this.currenciesUrl)
        .toPromise()
        .then( (res:any) => res['currencies'])
        .then( currenciesObject => {
            for(let key in currenciesObject){
              this.currencies.push(new Currency(key, currenciesObject[key]))
            }
            this.setCurrencies()
            resolve(currenciesObject);
          },
          msg => {
            reject()
          })
    })
  }
}
