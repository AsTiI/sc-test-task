import { Component, OnDestroy, Input } from '@angular/core';
import { ValueState } from './../../../../../state/value/value.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { RatesState } from './../../../../../state/rates/rates.state'
import {
  SetRate,
  UpdateRates
} from './../../../../../state/rates/rates.actions'

import {
  SetValue,
} from '../../../../../state/value/value.actions'

export interface Value2{
  code: string,
  value: string,
}

class Value{
  constructor(
    public code: string,
    public value: string,
  ) {
  }
}

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss']
})

export class CurrencyInputComponent {
  @Select(ValueState.value) value$!: Observable<{code: string, value: string}[]>;
  @Select(RatesState.rates) rates$!: Observable<{code: string, rate: string}[]>;

  rates!: {code: string, rate: string}[];
  value!: {code: string, value: string}[];

  private ratesSubscription: Subscription;
  private valueSubscription: Subscription;

  currentValue!: string;
  currentRate!: string;

  @Input() dataRate = {code: '', rate: ''};

  constructor(private storeValue: Store, private storeRates: Store) {
    this.ratesSubscription = this.rates$.subscribe((rates: {code: string, rate: string}[]) => {
      this.rates = rates;
      for(let key in this.rates){
        if(this.rates[key].code == this.dataRate.code){
          this.currentRate = this.rates[key].rate
        }
      }
    })
    this.valueSubscription = this.value$.subscribe((value: Value[]) => {
      this.value = value;
      for(let key in this.value){
        if(this.value[key].code == this.dataRate.code){
          this.currentValue = this.value[key].value
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.valueSubscription.unsubscribe();
    this.ratesSubscription.unsubscribe();
  }

  returnStoreRates(){
    if(this.rates[0].code == this.dataRate.code){
      this.currentValue = this.value[0].value;
    } else {
      this.currentValue = this.value[1].value
    }
  }
  updateStoreRates(){
    this.currentValue = ''
    if(this.rates[0].code == this.dataRate.code){
      this.rates = [{
        code: this.dataRate.code,
        rate: '1',
      },
        {
          code: this.rates[1].code,
          rate: (parseFloat(this.rates[1].rate) / parseFloat(this.rates[0].rate)).toString(),
        }]
    } else {
      this.rates = [{
        code: this.rates[0].code,
        rate: (parseFloat(this.rates[0].rate) / parseFloat(this.rates[1].rate)).toString(),
      },
        {
          code: this.dataRate.code,
          rate: '1',
        }]
    }
    this.dataRate.rate = '1';
    this.storeRates.dispatch(new SetRate(this.rates))

  }

  updateStoreValue(inputValue: string) : void{
    if (this.rates[0].code == this.dataRate.code) {
      this.value = [{
          code: this.rates[0].code,
          value: inputValue,
      },
        {
          code: this.rates[1].code,
          value: inputValue? parseFloat((parseFloat(inputValue) * parseFloat(this.rates[1].rate)).toString()).toFixed(2).toString(): '',
      }]
    } else {
      this.value = [{
          code: this.rates[0].code,
          value: inputValue?parseFloat((parseFloat(inputValue) * parseFloat(this.rates[0].rate)).toString()).toFixed(2).toString(): '',
      },
        {
          code: this.rates[1].code,
          value: inputValue,
        }]
    }
    this.storeValue.dispatch(new SetValue(this.value));
  }
}
