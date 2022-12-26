import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-flags',
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.scss']
})
export class FlagsComponent {
  @Input() flagId: string = '';
  constructor() {}

  handleMissingImage(event: Event){
    (event.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Blank.jpg';
  }
}
