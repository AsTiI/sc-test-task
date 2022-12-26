import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CurrencyState } from '../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import {
  UpdateValues,
} from '../../state/currency.actions'

  class Currency {
    constructor(
      public code: string,
      public value: string,) {
    }
  }
  class Values {
      constructor(
        public currency: {
          code: string,
          fullName: string,
        },
        public rates: string,
        public count: string,) {
      }
  }

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss']
})

export class CurrencyInputComponent implements  OnInit {
  @Select(CurrencyState.values) values$!: Observable<Values[]>;
  private currencySubscription!: Subscription;

  values!: Values[];
  currentValue!: Currency;

  @Input() dataRate = {
    currency: {
      code: '',
      fullName: '',
    },
    rates: '',
    count: '',
    popularCurrencies: [{code: '', fullName: ''}, {code: '', fullName: ''}, {code: '', fullName: ''}],
  };

  constructor(private storeCurrency: Store) {}

  ngOnInit(): void {
    this.currencySubscription = this.values$.subscribe((values: Values[]
    ) => {
      this.values = values;
      if(this.dataRate.rates == '1.0000'){
        this.currentValue = { code: this.values[0].currency.code, value: this.values[0].count }
      }
      else{
        this.currentValue = { code: this.values[1].currency.code, value: this.values[1].count }
      }
    });
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  updateStoreValue(inputValue: string) : void{
    this.storeCurrency.dispatch(new UpdateValues([this.currentValue.code, inputValue]));
  }
}
