import { ValueState } from './state/value/value.state'
import { CurrencyState } from './state/currency/currency.state'
import { RatesState } from './state/rates/rates.state'
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment'


import { AppComponent } from './app.component';
import { ConverterComponent } from './components/converter/converter.component';
import { CurrenciesComponent } from './components/converter/currencies/currencies.component';
import { CurrencyComponent } from './components/converter/currencies/currency/currency.component';
import { CurrencyInputComponent } from './components/converter/currencies/currency/currency-input/currency-input.component';
import { CurrencySearchComponent } from './components/converter/currencies/currency/currency-search/currency-search.component';
import { FlagsComponent } from './components/converter/currencies/currency/currency-search/flags/flags.component';
import { FilterPipe, ValuePipe } from './pipes/filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ConverterComponent,
    CurrenciesComponent,
    CurrencyComponent,
    CurrencyInputComponent,
    CurrencySearchComponent,
    FlagsComponent,
    FilterPipe,
    ValuePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgxsModule.forRoot([ValueState, CurrencyState, RatesState], {
      developmentMode: !environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
