import { Component, OnInit, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  private currenciesApiKey = 'f013ed5fadf1ced601a16d11e5521baebe0d2b3f';

  private currencySubscription: Subscription;
  private ratesSubscription: Subscription;

  currencies: Currency[] = [];
  rates!: Rate[];
  @Input() dataCode = '';
  search!: string;

  showPopularCurrencies: boolean;

  currentCurrencyValue!: Currency;

  constructor(private httpClient: HttpClient, private storeCurrency: Store, private storeRates: Store) {
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
    this.ratesSubscription.unsubscribe();
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

  }

  getCurrenciesRateFromApi(){
    let ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/2022-10-26?api_key=${this.currenciesApiKey}&from=${this.rates[0].code}&to=${this.rates[1].code}&format=json`;
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
            // this.setValues()
          resolve(res);
        }, msg => {
            alert('You reached the limit of your currency requests for the day');
          })
    })

  }



}
