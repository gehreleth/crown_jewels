import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IArea } from '../area'
import { Action } from '../action'

export interface IScaleEvent {
  action: Action, nestedEvent: any
}

@Component({
  selector: 'app-ire-main-area-handlers',
  styles : [],
  template: `
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleNW"
  (mousedown) = "onMouseDown($event, ScaleNW)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleN"
  (mousedown) = "onMouseDown($event, ScaleN)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleNE"
  (mousedown) = "onMouseDown($event, ScaleNE)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleW"
  (mousedown) = "onMouseDown($event, ScaleW)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleE"
  (mousedown) = "onMouseDown($event, ScaleE)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleSW"
  (mousedown) = "onMouseDown($event, ScaleSW)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleS"
  (mousedown) = "onMouseDown($event, ScaleS)">
</app-ire-main-area-handle>
<app-ire-main-area-handle
  [area] = "area"
  [action] = "ScaleSE"
  (mousedown) = "onMouseDown($event, ScaleSE)">
</app-ire-main-area-handle>
`
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

  @Input() area: IArea;
  @Output() onScale: EventEmitter<IScaleEvent> =
    new EventEmitter<IScaleEvent>();

  private onMouseDown(event: any, action: Action) {
    const scaleEvent: IScaleEvent = {
      action: action, nestedEvent: event
    }
    this.onScale.emit(scaleEvent);
  }
}
