import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IArea } from '../ire-main-area/area'

const HorzOffset: number = 5; // TODO : derieve from image and handle size
const VertOffset: number = -29;

@Component({
  selector: 'app-ire-main-area-delete',
  styles : [],
  template: `
<div *ngIf="show" class="delete-area" [ngStyle]="style">
  <div class="select-areas-delete-area"></div>
</div>
`
})
export class IreMainAreaDeleteComponent {
  @Input() area: IArea;
  @Input() show: boolean;

  constructor() { }

  private get style(): any {
    return  {  'position': 'absolute',
               'cursor': 'pointer',
               'left': `${ this.area.x + this.area.width + HorzOffset }px`,
               'top': `${ this.area.y + VertOffset }px`,
               'z-index': 1 };
  }
}
