import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})

export class CurrencyComponent {

  @Input() dataValue = {
    currency: {
      code: '',
      fullName: '',
    },
    rates: '',
    count: '',
  };

  constructor() {}

}
