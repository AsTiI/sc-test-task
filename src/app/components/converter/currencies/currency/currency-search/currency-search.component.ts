import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ValueState } from './../../../../../state/value/value.state';
import { CurrencyState } from './../../../../../state/currency/currency.state';
import { RatesState } from './../../../../../state/rates/rates.state'
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { CurrenciesModel } from './../../../../../state/currency/currency.model';
import { map, catchError} from 'rxjs/operators';

import {
  SetRate,
  UpdateRates
} from './../../../../../state/rates/rates.actions'
import {
  SetValue,
} from '../../../../../state/value/value.actions'

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
  selector: 'app-currency-search',
  templateUrl: './currency-search.component.html',
  styleUrls: ['./currency-search.component.scss']
})
export class CurrencySearchComponent implements OnInit {
  @Select(CurrencyState.currencies) currencies$!: Observable<Currency[]>;
  @Select(RatesState.rates) rates$!: Observable<Rate[]>;
  @Select(ValueState.value) value$!: Observable<{code: string, value: string}[]>;
  @Select(RatesState.ratesData) ratesData$!: Observable<string>;

  private currenciesApiKey = '0e92cb399c53f7f7b25ade450bfec9bead566d36';

  private currencySubscription: Subscription;
  private ratesSubscription: Subscription;
  private valueSubscription: Subscription;
  private ratesDataSubscription: Subscription;

  value!: {code: string, value: string}[];
  currencies: Currency[] = [];
  rates!: Rate[];
  ratesData!: string;
  @Input() dataCode = '';
  search!: string;

  showPopularCurrencies: boolean;

  currentCurrencyValue!: Currency;

  constructor(private httpClient: HttpClient, private storeCurrency: Store, private storeRates: Store, private storeValue: Store) {
    this.ratesDataSubscription = this.ratesData$.subscribe((data: string) => {
      this.ratesData = data;
    })
    this.currencySubscription = this.currencies$.subscribe((currencies: Currency[]) => {
      this.currencies = currencies
      for(let key in this.currencies){
        if(this.currencies[key].code == this.dataCode){
          this.currentCurrencyValue = {
            code: this.currencies[key].code,
            name: this.currencies[key].name,
          }
          this.search = this.currencies[key].code + '  '+ this.currencies[key].name;
        }
      }
    });
    this.valueSubscription = this.value$.subscribe((value: {code: string, value: string}[]) => {
      this.value = value;
    });

    this.ratesSubscription = this.rates$.subscribe((rates: Rate[]) => {
      this.rates = rates;
    })

    this.showPopularCurrencies = false;
    this.search = '';
    this.currentCurrencyValue = {code: '', name: ''}

  }

  handleMissingImage(event: Event){
    (event.target as HTMLImageElement).src = 'https://avatanplus.com/files/resources/original/5cadb6ffe1bf016a0692d7b5.jpg';
  }

  ngOnInit(): void {
    this.getCurrenciesRateFromApi()
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
    this.ratesSubscription.unsubscribe();
    this.valueSubscription.unsubscribe();
    this.ratesDataSubscription.unsubscribe();
  }

  chooseCurrency(newCurrencyValue: Currency){
      if(this.rates[0].code == this.currentCurrencyValue.code){
        this.rates[0].code = newCurrencyValue.code;
      }
      else{
        this.rates[1].code = newCurrencyValue.code;
      }
    this.currentCurrencyValue.code = newCurrencyValue.code;
    this.getCurrenciesRateFromApi();
    this.search = newCurrencyValue.code + '  '+ newCurrencyValue.name;
    this.toggleCurrencyModal()
  }
  toggleCurrencyModal(){
    this.showPopularCurrencies = !this.showPopularCurrencies;
  }

  onSearch(){
    this.search = '';
    this.toggleCurrencyModal()
  }
  onCloseSearch() {
    if(this.showPopularCurrencies){
      this.search = this.currentCurrencyValue.code + '  '+ this.currentCurrencyValue.name;
      this.toggleCurrencyModal()
    }
  }
  updateRates() {
    this.storeRates.dispatch((new UpdateRates(this.rates)))
  }
  setValues(){
    this.storeValue.dispatch((new SetValue([{
      code: this.rates[0].code,
      value: (parseFloat(this.value[0].value) * parseFloat(this.rates[0].rate)).toFixed(2).toString()
    },
      {
        code: this.rates[1].code,
        value: (parseFloat(this.value[0].value) * parseFloat(this.rates[1].rate)).toFixed(2).toString(),
      }])))
  }

  getCurrenciesRateFromApi(){

    let ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${this.ratesData}?api_key=${this.currenciesApiKey}&from=${this.rates[0].code}&to=${this.rates[1].code}&format=json`;
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

            this.updateRates();
            this.setValues();
          resolve(res);
        }, msg => {
            alert('You reached the limit of your currency requests for the day');
          })
    })

  }



}
