import { Component, OnInit, Input } from '@angular/core';

import { CurrencyState } from '../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { map, catchError} from 'rxjs/operators';

import { CurrencyStateModel,  Currency, CurrencyDescription, CurrencyValues, LocalStorage } from '../../state/currency.model';

import {
  UpdateCurrency
} from '../../state/currency.actions'

@Component({
  selector: 'app-currency-search',
  templateUrl: './currency-search.component.html',
  styleUrls: ['./currency-search.component.scss']
})
export class CurrencySearchComponent implements OnInit {

  @Select(CurrencyState.currency) currency$!: Observable<CurrencyStateModel>;
  private currencySubscription!: Subscription;

  currency!: CurrencyStateModel;

  @Input() dataCode = {
    description: {
      abbr: '',
      fullName: '',
    },
    values: {
      rates: 0.0000,
      count: 0.0000,
    },
    popularCurrencies: [
      {
        abbr: '',
        fullName: ''
      },
      {
        abbr: '',
        fullName: ''
      },
      {
        abbr: '',
        fullName: ''
      },
    ],
  };

  search!: string;
  showPopularCurrencies!: boolean;
  currentCurrencyValue!: {
    description: CurrencyDescription,
    popularCurrencies: CurrencyDescription[]
  };

  constructor(private storeCurrency: Store) {}

  ngOnInit(): void {
    this.showPopularCurrencies = false;
    this.currencySubscription = this.currency$.subscribe((currency: CurrencyStateModel) => {
      this.currency = currency;
      this.currentCurrencyValue = this.dataCode.values.rates == 1.0000?
        {
          description: currency.leftSideCurrency.description,
          popularCurrencies: currency.popularCurrencies.leftSideCurrency,
        }:
        {
          description: currency.rightSideCurrency.description,
          popularCurrencies: currency.popularCurrencies.rightSideCurrency,
        };
      this.search = this.currentCurrencyValue.description.abbr + '  ' + this.currentCurrencyValue.description.fullName;

    });
  }
  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  handleMissingImage(event: Event){
    (event.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Blank.jpg';
  }
  chooseCurrency(newCurrencyValue: CurrencyDescription) {
    if (newCurrencyValue.abbr != this.currentCurrencyValue.description.abbr) {
      this.storeCurrency.dispatch(new UpdateCurrency(newCurrencyValue, this.currentCurrencyValue.description.abbr))
      this.currentCurrencyValue.description = newCurrencyValue;
    }
    this.onCloseSearch();
  }
  choosePopularCurrency(popularCurrency: CurrencyDescription) {
    this.storeCurrency.dispatch(new UpdateCurrency(popularCurrency, this.currentCurrencyValue.description.abbr))
    this.currentCurrencyValue.description = popularCurrency;
    this.search = this.currentCurrencyValue.description.abbr + '  '+ this.currentCurrencyValue.description.fullName;
  }
  onSearch(){
    this.search = '';
    this.toggleCurrencyModal()
  }
  onCloseSearch() {
    if(this.showPopularCurrencies){
      this.search = this.currentCurrencyValue.description.abbr + '  '+ this.currentCurrencyValue.description.fullName;
      this.toggleCurrencyModal()
    }
  }
  toggleCurrencyModal(){
    this.showPopularCurrencies = !this.showPopularCurrencies;
  }
}
