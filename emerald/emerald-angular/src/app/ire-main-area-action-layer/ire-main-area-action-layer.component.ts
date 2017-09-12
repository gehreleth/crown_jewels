import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Action } from '../ire-main-area/action';

@Component({
  selector: 'app-ire-main-area-action-layer',
  styles : [],
  template: `
<i *ngIf="layerActive">
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
  @Input() action: Action;

  @Output() mousedown: EventEmitter<any> = new EventEmitter<any>();
  @Output() mouseout: EventEmitter<any> = new EventEmitter<any>();
  @Output() mousemove: EventEmitter<any> = new EventEmitter<any>();
  @Output() mouseup: EventEmitter<any> = new EventEmitter<any>();

  private get layerActive() : boolean {
    return this.action !== Action.NoAction;
  }

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
    let cursor: string;
    switch (this.action) {
      case Action.Add:
        cursor = 'crosshair';
        break;
      case Action.Move:
        cursor = 'move';
        break;
      case Action.ScaleNW:
        cursor = 'nw-resize';
        break;
      case Action.ScaleN:
        cursor = 'n-resize';
        break;
      case Action.ScaleNE:
        cursor = 'ne-resize';
        break;
      case Action.ScaleW:
        cursor = 'w-resize';
        break;
      case Action.ScaleE:
        cursor = 'e-resize';
        break;
      case Action.ScaleSW:
        cursor = 'sw-resize';
        break;
      case Action.ScaleS:
        cursor = 's-resize';
        break;
      case Action.ScaleSE:
        cursor = 'se-resize';
        break;
      default:
        cursor = 'default';
    }

    return {   'position': 'absolute',
               'width': `${this.outerWidth}px`,
               'height': `${this.outerHeight}px`,
               'display': 'block',
               'cursor': cursor,
               'z-index': 10000 };
  }
}
