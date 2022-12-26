import { Component, OnInit, Input } from '@angular/core';

import { CurrencyState } from '../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { map, catchError} from 'rxjs/operators';

import {
  UpdateCurrency
} from '../../state/currency.actions'


class CurrentCurrency{
  constructor(
    public code: string,
    public fullName: string,
  ) {}
}
class Currency {
  constructor(
    public date: string,
    public currencies: {
      code: string,
      fullName: string,
    }[],
    public values: {
      currency: {
        code: string,
        fullName: string,
      },
      rates: string,
      count: string,
      popularCurrencies: CurrentCurrency[],
    }[],
  ) {
  }
}

@Component({
  selector: 'app-currency-search',
  templateUrl: './currency-search.component.html',
  styleUrls: ['./currency-search.component.scss']
})
export class CurrencySearchComponent implements OnInit {

  @Select(CurrencyState.currency) currency$!: Observable<Currency>;
  private currencySubscription!: Subscription;

  currency!: Currency;

  @Input() dataCode = {
    currency: {
      code: '',
      fullName: '',
    },
    rates: '',
    count: '',
    popularCurrencies: [{code: '', fullName: ''}, {code: '', fullName: ''}, {code: '', fullName: ''}],
  };

  search!: string;
  showPopularCurrencies!: boolean;
  currentCurrencyValue!: CurrentCurrency;

  constructor(private storeCurrency: Store) {}

  ngOnInit(): void {
    this.showPopularCurrencies = false;
    this.currencySubscription = this.currency$.subscribe((currency: Currency) => {
      this.currency = currency;
      if(this.dataCode.rates == '1.0000') {
        this.currentCurrencyValue = new CurrentCurrency(currency.values[0].currency.code, currency.values[0].currency.fullName)
      }
      else {
        this.currentCurrencyValue = new CurrentCurrency(currency.values[1].currency.code, currency.values[1].currency.fullName)
      }
      this.search = this.currentCurrencyValue.code + '  ' + this.currentCurrencyValue.fullName;

    });

  }
  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  handleMissingImage(event: Event){
    (event.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Blank.jpg';
  }
  chooseCurrency(newCurrencyValue: CurrentCurrency) {
    if (newCurrencyValue.code != this.currentCurrencyValue.code) {
      this.storeCurrency.dispatch(new UpdateCurrency(newCurrencyValue, this.currentCurrencyValue.code))
      this.currentCurrencyValue = newCurrencyValue;
    }
    this.onCloseSearch();
  }
  choosePopularCurrency(popularCurrency: CurrentCurrency) {
    this.storeCurrency.dispatch(new UpdateCurrency(popularCurrency, this.currentCurrencyValue.code))
    this.currentCurrencyValue = popularCurrency;
    this.search = this.currentCurrencyValue.code + '  '+ this.currentCurrencyValue.fullName;
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
  toggleCurrencyModal(){
    this.showPopularCurrencies = !this.showPopularCurrencies;
  }
}
