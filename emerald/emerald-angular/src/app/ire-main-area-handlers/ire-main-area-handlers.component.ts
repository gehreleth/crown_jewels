import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Action } from '../ire-main-area/action'

export interface IHandleMouseDown {
  action: Action, attachment: any
}

@Component({
  selector: 'app-ire-main-area-handlers',
  styles : [],
  template: `
<div *ngIf="show">
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleNW"
    (mousedown) = "onHandleMouseDown($event, ScaleNW)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleN"
    (mousedown) = "onHandleMouseDown($event, ScaleN)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleNE"
    (mousedown) = "onHandleMouseDown($event, ScaleNE)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleW"
    (mousedown) = "onHandleMouseDown($event, ScaleW)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleE"
    (mousedown) = "onHandleMouseDown($event, ScaleE)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleSW"
    (mousedown) = "onHandleMouseDown($event, ScaleSW)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleS"
    (mousedown) = "onHandleMouseDown($event, ScaleS)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [action] = "ScaleSE"
    (mousedown) = "onHandleMouseDown($event, ScaleSE)">
  </app-ire-main-area-handle>
</div>`
})
export class IreMainAreaHandlersComponent {
  private readonly ScaleNW = Action.ScaleNW;
  private readonly ScaleN = Action.ScaleN;
  private readonly ScaleNE = Action.ScaleNE;
  private readonly ScaleW = Action.ScaleW;
  private readonly ScaleE = Action.ScaleE;
  private readonly ScaleSW = Action.ScaleSW;
  private readonly ScaleS = Action.ScaleS;
  private readonly ScaleSE = Action.ScaleSE;

  @Input() area: any;
  @Input() show: boolean;
  @Output() mousedown: EventEmitter<IHandleMouseDown> =
    new EventEmitter<IHandleMouseDown >();

  private onHandleMouseDown(event: any, action: Action) {
    const e : IHandleMouseDown = {
      action: action, attachment: event
    }
    this.mousedown.emit(e);
  }
}
