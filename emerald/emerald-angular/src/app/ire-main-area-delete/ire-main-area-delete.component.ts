import { Component, Input, Output, EventEmitter } from '@angular/core';

const HorzOffset: number = 5; // TODO : derieve from image and handle size
const VertOffset: number = -29;

@Component({
  selector: 'app-ire-main-area-delete',
  styles : [],
  template: `
<div *ngIf="show">
  <div class="delete-area" [ngStyle]="style">
    <div class="select-areas-delete-area"
         (click)="onClick($event)">
    </div>
  </div>
</div>
`
})
export class IreMainAreaDeleteComponent {
  @Input() area: any;
  @Input() show: boolean;
  @Output() click: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  private onClick(event: any): void {
    this.click.emit(event);
  }

  private get style(): any {
    return  {  'position': 'absolute',
               'cursor': 'pointer',
               'left': `${ this.area.x + this.area.width + HorzOffset }px`,
               'top': `${ this.area.y + VertOffset }px`,
               'z-index': 1 };
  }
}
