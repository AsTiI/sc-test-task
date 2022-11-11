import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CurrencyState } from './../../../../../state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import {
  SetValues,
} from './../../../../../state/currency.actions'

class Values {
  constructor() {
  }
}

class Currency{
  constructor(
    public code: string,
    public value: string,
  ) {}
}
@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss']
})

export class CurrencyInputComponent implements  OnInit {
  @Select(CurrencyState.values) values$!: Observable<{
    currency: {
      code: string,
      fullName: string,
    },
    rates: string,
    count: string,
  }[]>;

  values!: {
    currency: {
      code: string,
      fullName: string,
    },
    rates: string,
    count: string,
  }[];

  private currencySubscription: Subscription;

  currentValue!: Currency;

  @Input() dataRate = {
    currency: {
      code: '',
      fullName: '',
    },
    rates: '',
    count: '',
  };

  constructor(private storeCurrency: Store) {
    this.currencySubscription = this.values$.subscribe((values: {
        currency: {
          code: string,
          fullName: string,
        },
        rates: string,
        count: string,
      }[]
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

  ngOnInit(): void {
    if(this.dataRate.rates == '1.0000'){
      this.currentValue = { code: this.values[0].currency.code, value: this.values[0].count }
    }
    else{
      this.currentValue = { code: this.values[1].currency.code, value: this.values[1].count }
    }
  }

  ngOnDestroy(): void {
    this.currencySubscription.unsubscribe();
  }

  updateStoreValue(inputValue:string) : void{
    if (this.values[0].currency.code == this.currentValue.code) {
      this.storeCurrency.dispatch(new SetValues([
        {
          currency: this.values[0].currency,
          rates: this.values[0].rates,
          count: inputValue,
        },
        {
          currency: this.values[1].currency,
          rates: this.values[1].rates,
          count: inputValue? parseFloat((parseFloat(inputValue) * parseFloat(this.values[1].rates)/ parseFloat(this.values[0].rates)).toString()).toFixed(2).toString(): '',
        }]));
      } else {
      this.storeCurrency.dispatch(new SetValues([
        {
          currency: this.values[0].currency,
          rates: this.values[0].rates,
          count: inputValue? parseFloat((parseFloat(inputValue) * parseFloat(this.values[0].rates)/ parseFloat(this.values[1].rates)).toString()).toFixed(2).toString(): '',
        },
        {
          currency: this.values[1].currency,
          rates: this.values[1].rates,
          count: inputValue,
        }]));
        }
  }
}
