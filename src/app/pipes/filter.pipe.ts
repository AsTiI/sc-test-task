import { Pipe, PipeTransform } from '@angular/core';

class Currency {
  constructor(public code: string, public fullName: string) {}
}
@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
  transform(value: Currency[], searchValue: string): Currency[] {
    return value.filter(( v: Currency) =>
      v.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
      v.fullName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
  }
}

@Pipe({
  name: 'removeZeros'
})
export class ValuePipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/^0+/, '')
  }
}
