import { Component, OnInit, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { RatesState } from './../../../state/rates/rates.state'
import { CurrencyState } from './../../../state/currency/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { CurrenciesModel } from './../../../state/currency/currency.model'
import {
  SetCurrency
} from './../../../state/currency/currency.actions'
import { SetRate } from './../../../state/rates/rates.actions'
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


  private currenciesApiKey = 'f013ed5fadf1ced601a16d11e5521baebe0d2b3f';
  private currenciesUrl = `https://api.getgeoapi.com/v2/currency/list?api_key=${this.currenciesApiKey}&format=json`;
  private ratesSubscription: Subscription;


  dateValue: string;
  maxDate: string;
  currencies: Currency[] = [];
  rates!: Rate[];

  constructor(private httpClient: HttpClient, private storeCurrency: Store, private storeRates: Store) {
    this.ratesSubscription = this.rates$.subscribe((value: Rate[]) => {
      this.rates = value
    })
    // this.dateValue = new Date().toLocaleDateString();
    this.dateValue = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate();
    this.maxDate = this.getDate();
  }
  ngOnInit(): void {
    this.getDate();
    this.getCurrenciesFromApi()
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
    console.log(rateDate)
  }
  // setRate(){
  //   this.storeRates.dispatch((new SetRate([{code: '', rate: ''},{code: '', rate: ''}])))
  // }
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
