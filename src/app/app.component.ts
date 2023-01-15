import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { CurrencyState } from '../app/state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { CurrencyStateModel,  Currency, CurrencyDescription, CurrencyValues, LocalStorage } from './state/currency.model';

import {
  UpdateDate, SetInitialValues, SwapCurrencies
} from '../app/state/currency.actions'

interface sideCurrencyValuesModel {
  leftSideCurrency: {
    description: CurrencyDescription,
    values: CurrencyValues,
    popularCurrencies: CurrencyDescription[]
  },
  rightSideCurrency: {
    description: CurrencyDescription,
    values: CurrencyValues,
    popularCurrencies: CurrencyDescription[]
  },
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @Select(CurrencyState.sideCurrencyValues) sideCurrencyValues$!: Observable<sideCurrencyValuesModel>
  private sideCurrencyValuesSubscriptor!: Subscription;

  dateValue: string;
  maxDate: string;

  sideCurrencyValues!: sideCurrencyValuesModel;

  constructor(private storeCurrency: Store) {
    this.dateValue = this.getDate();
    this.maxDate = this.getDate();
  }

  ngOnInit(): void {
    this.storeCurrency.dispatch(new SetInitialValues());

    this.sideCurrencyValuesSubscriptor = this.sideCurrencyValues$.subscribe((sideCurrencyValues: sideCurrencyValuesModel) => {
      this.sideCurrencyValues = sideCurrencyValues;
    })
  }

  ngOnDestroy(): void {
    this.sideCurrencyValuesSubscriptor.unsubscribe();
  }

  updateDate(value: string){
    this.storeCurrency.dispatch(new UpdateDate(value))
  }

  getDate(): string{
    let today = new Date();
    let dd = (today.getDate()).toString();
    let mm = (today.getMonth() + 1).toString();
    let yyyy = today.getFullYear().toString();
    if(parseInt(dd) < 10){
      dd = '0' + dd.toString()
    }
    if(parseInt(mm) < 10){
      mm = '0' + mm.toString()
    }
    return yyyy + '-' + mm + '-' + dd
  }
  swapCurrencies(){
    this.storeCurrency.dispatch(new SwapCurrencies());
  }
}
