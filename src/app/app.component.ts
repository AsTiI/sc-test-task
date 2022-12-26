import { Component, OnInit, Input} from '@angular/core';

import { CurrencyState } from '../app/state/currency.state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import {
  UpdateDate, SetInitialValues, SwapCurrencies
} from '../app/state/currency.actions'
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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Select(CurrencyState.currency) currency$!: Observable<Currency>;
  private currencySubscriptor!: Subscription;

  dateValue: string;
  maxDate: string;
  currencies!: Currency;

  constructor(private storeCurrency: Store) {
    this.dateValue = this.getDate();
    this.maxDate = this.getDate();
  }

  ngOnInit(): void {
    this.currencySubscriptor = this.currency$.subscribe((currencies: Currency) => {
      this.currencies = currencies;
    })
    this.storeCurrency.dispatch(new SetInitialValues());
  }

  ngOnDestroy(): void {
    this.currencySubscriptor.unsubscribe();
  }

  updateDate(value: string){
    this.storeCurrency.dispatch(new UpdateDate(value))
  }

  getDate(): string{
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if(dd < 10){
      dd = parseInt('0' + dd.toString())
    }
    if(mm < 10){
      mm = parseInt('0' + mm.toString())
    }
    return yyyy.toString() + '-' + mm.toString() + '-' + dd.toString()
  }
  swapCurrencies(){
    this.storeCurrency.dispatch(new SwapCurrencies());
  }
}
