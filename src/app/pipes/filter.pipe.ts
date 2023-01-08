import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyDescription } from '../state/currency.model';

class Currency {
  constructor(public code: string, public fullName: string) {}
}
@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
  transform(value: CurrencyDescription[], searchValue: string): CurrencyDescription[] {
    return value.filter(( v: CurrencyDescription) =>
      v.abbr.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
      v.fullName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
  }
}
