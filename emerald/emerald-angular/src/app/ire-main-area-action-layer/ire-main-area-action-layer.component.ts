import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Action } from '../ire-main-area/action';

@Component({
  selector: 'app-ire-main-area-action-layer',
  styles : [],
  template: `
<i *ngIf="active">
  <div [ngStyle]="style"
       (mousedown)="onMouseDown($event)"
       (mouseout)="onMouseOut($event)"
       (mousemove)="onMouseMove($event)"
       (mouseup)="onMouseUp($event)">
  </div>
</i>`
})
export class IreMainAreaActionLayerComponent {
  @Input() outerWidth: number;
  @Input() outerHeight: number;
  @Input() active: boolean;

  @Output() mousedown: EventEmitter<any> = new EventEmitter<any>();
  @Output() mouseout: EventEmitter<any> = new EventEmitter<any>();
  @Output() mousemove: EventEmitter<any> = new EventEmitter<any>();
  @Output() mouseup: EventEmitter<any> = new EventEmitter<any>();

  private onMouseDown(event: any): void {
    this.mousedown.emit(event);
  }

  private onMouseOut(event: any): void {
    this.mouseout.emit(event);
  }

  private onMouseMove(event: any): void {
    this.mousemove.emit(event);
  }

  private onMouseUp(event: any): void {
    this.mouseup.emit(event);
  }

  private get style(): any {
    return {   'position': 'absolute',
               'width': `${this.outerWidth}px`,
               'height': `${this.outerHeight}px`,
               'display': 'block',
               'cursor': 'crosshair',
               'z-index': 10000 };
  }
}
