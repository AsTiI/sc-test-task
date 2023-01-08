import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CurrencyState } from '../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { CurrencyStateModel,  Currency, CurrencyDescription, CurrencyValues, LocalStorage } from '../../state/currency.model';

import {
  UpdateValues,
} from '../../state/currency.actions';

interface sideCurrencyValuesModel {
  leftSideCurrency: Currency,
  rightSideCurrency: Currency,
}

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss']
})

export class CurrencyInputComponent implements  OnInit {
  @Select(CurrencyState.values) values$!: Observable<sideCurrencyValuesModel>;
  private currencySubscription!: Subscription;

  values!: sideCurrencyValuesModel;
  currentValue!: Currency;

  @Input() dataRate = {
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

  constructor(private storeCurrency: Store) {}

  ngOnInit(): void {
    this.currencySubscription = this.values$.subscribe((values: sideCurrencyValuesModel) => {
      this.values = values;
      this.currentValue = this.dataRate.values.rates == 1.0000 ?
        this.currentValue =
          {
            description: values.leftSideCurrency.description,
            values: {
              rates: values.leftSideCurrency.values.rates,
              count: values.leftSideCurrency.values.count
            }
          }:
        this.currentValue =
          {
            description: values.rightSideCurrency.description,
            values: {
              rates: values.rightSideCurrency.values.rates,
              count: values.rightSideCurrency.values.count
            }
          }
    });
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  updateStoreValue(inputValue: string) : void{
    this.storeCurrency.dispatch(new UpdateValues({ abbr: this.currentValue.description.abbr, count: +inputValue}));
  }
}
