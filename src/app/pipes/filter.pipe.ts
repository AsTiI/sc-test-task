import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, searchValue:string): any {
    return value.filter((v:any) =>
      v.code.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
      v.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
  }
}

@Pipe({
  name: 'delZeros'
})
export class ValuePipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/^0+/, '')
  }
}
