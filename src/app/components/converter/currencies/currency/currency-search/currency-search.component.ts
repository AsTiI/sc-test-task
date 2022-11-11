import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CurrencyState } from './../../../../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { map, catchError} from 'rxjs/operators';

import {
  SetValues,
} from './../../../../../state/currency.actions'


class Currency{
  constructor(
    public code: string,
    public fullName: string,
  ) {}
}

@Component({
  selector: 'app-currency-search',
  templateUrl: './currency-search.component.html',
  styleUrls: ['./currency-search.component.scss']
})
export class CurrencySearchComponent implements OnInit {
  private currenciesApiKey = '135cf9bf129e0a9aed44050143e2d36d2f3ba2b2';

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
  private currencySubscription: Subscription;

  currency!: {
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

  @Input() dataCode = {
    currency: {
      code: '',
      fullName: '',
    },
    rates: '',
    count: '',
  };
  search!: string;
  showPopularCurrencies: boolean;
  currentCurrencyValue!: Currency;

  constructor(private httpClient: HttpClient, private storeCurrency: Store) {
    this.currencySubscription = this.currency$.subscribe((currency: {
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
      this.currency = currency;
    });
    this.search = '';

    this.showPopularCurrencies = false;
  }

  handleMissingImage(event: Event){
    (event.target as HTMLImageElement).src = 'https://avatanplus.com/files/resources/original/5cadb6ffe1bf016a0692d7b5.jpg';
  }

  ngOnInit(): void {
    for(let key in this.currency.values){
      if(this.currency.values[key].currency.code == this.dataCode.currency.code){
        this.currentCurrencyValue = {
          code: this.currency.values[key].currency.code,
          fullName: this.currency.values[key].currency.fullName,
        }
        this.search = this.currency.values[key].currency.code + '  ' + this.currency.values[key].currency.fullName;
      }
    }
    this.getCurrenciesRateFromApi()
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  chooseCurrency(newCurrencyValue: Currency) {
    if (newCurrencyValue.code != this.currentCurrencyValue.code) {
      this.currentCurrencyValue.code = newCurrencyValue.code;

      let ratesUrl: string;
      if (this.dataCode.rates == '1.0000') {
        ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${this.currency.date}?api_key=${this.currenciesApiKey}&from=${newCurrencyValue.code}&to=${this.currency.values[1].currency.code}&format=json`;
      } else {
        ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${this.currency.date}?api_key=${this.currenciesApiKey}&from=${this.currency.values[0].currency.code}&to=${newCurrencyValue.code}&format=json`;
      }
      let promise = new Promise((resolve, reject) => {
        this.httpClient.get(ratesUrl)
          .toPromise()
          .then((res: any) => {
            if (this.dataCode.rates == '1.0000') {
              this.storeCurrency.dispatch(new SetValues([
                {
                  currency: {
                    code: newCurrencyValue.code,
                    fullName: newCurrencyValue.fullName,
                  },
                  rates: '1.0000',
                  count: this.currency.values[0].count,
                }, {
                  currency: this.currency.values[1].currency,
                  rates: res['rates'][this.currency.values[1].currency.code]['rate'],
                  count: (parseFloat(this.currency.values[0].count) * parseFloat(res['rates'][this.currency.values[1].currency.code]['rate'])).toFixed(2).toString(),
                }]));

            } else {
              this.storeCurrency.dispatch(new SetValues([
                {
                  currency: this.currency.values[0].currency,
                  rates: '1.0000',
                  count: this.currency.values[0].count
                },
                {
                  currency: {
                    code: newCurrencyValue.code,
                    fullName: newCurrencyValue.fullName
                  },
                  rates: res['rates'][newCurrencyValue.code]['rate'],
                  count: (parseFloat(this.currency.values[0].count) * parseFloat(res['rates'][newCurrencyValue.code]['rate'])).toFixed(2).toString()
                }]));
            }
            resolve(res);
          }, msg => {
            alert('You reached the limit of your currency requests for the day');
          })
      })
    }
    this.search = newCurrencyValue.code + '  '+ newCurrencyValue.fullName;
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
      this.search = this.currentCurrencyValue.code + '  '+ this.currentCurrencyValue.fullName;
      this.toggleCurrencyModal()
    }
  }

  getCurrenciesRateFromApi(){
    let ratesUrl = `https://api.getgeoapi.com/v2/currency/historical/${this.currency.date}?api_key=${this.currenciesApiKey}&from=${this.currency.values[0].currency.code}&to=${this.currency.values[1].currency.code}&format=json`;
    let promise = new Promise((resolve,reject) => {
        this.httpClient.get(ratesUrl)
          .toPromise()
          .then((res: any) => {
              if(this.currency.values[0].currency.code == res['base_currency_code']){
                this.storeCurrency.dispatch(new SetValues([
                  {
                    currency: this.currency.values[0].currency,
                    rates: res['amount'],
                    count: this.currency.values[0].count
                  }, {
                  currency: this.currency.values[1].currency,
                    rates: res['rates'][this.currency.values[1].currency.code]['rate'],
                    count: (parseFloat(this.currency.values[0].count) * parseFloat(res['rates'][this.currency.values[1].currency.code]['rate'])).toFixed(2).toString(),
                  }]));
              } else {
                this.storeCurrency.dispatch(new SetValues([
                  {
                    currency: this.currency.values[0].currency,
                    rates: res['rates'][this.currency.values[0].currency.code]['rate'],
                    count: (parseFloat(this.currency.values[0].count) * parseFloat(res['rates'][this.currency.values[0].currency.code]['rate'])).toFixed(2).toString()
                  },
                  {
                    currency: this.currency.values[1].currency,
                    rates: res['amount'],
                    count: this.currency.values[1].count
                  }]));
              }
          resolve(res);
        }, msg => {
            alert('You reached the limit of your currency requests for the day');
          })
    })
  }

}
