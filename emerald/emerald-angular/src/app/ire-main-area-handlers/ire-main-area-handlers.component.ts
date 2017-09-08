import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PrincipialWind } from '../ire-main-area-handle/ire-main-area-handle.component'

export interface IHandleMouseDown {
  handle: PrincipialWind, attachment: any
}

@Component({
  selector: 'app-ire-main-area-handlers',
  styles : [],
  template: `
<i *ngIf="show">
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "NW"
    (mousedown) = "onHandleMouseDown($event, NW)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "N"
    (mousedown) = "onHandleMouseDown($event, N)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "NE"
    (mousedown) = "onHandleMouseDown($event, NE)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "W"
    (mousedown) = "onHandleMouseDown($event, W)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "E"
    (mousedown) = "onHandleMouseDown($event, E)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "SW"
    (mousedown) = "onHandleMouseDown($event, SW)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "S"
    (mousedown) = "onHandleMouseDown($event, S)">
  </app-ire-main-area-handle>
  <app-ire-main-area-handle
    [area] = "area"
    [position] = "SE"
    (mousedown) = "onHandleMouseDown($event, SE)">
  </app-ire-main-area-handle>
</i>`
})
export class IreMainAreaHandlersComponent {
  private readonly NW = PrincipialWind.NW;
  private readonly N = PrincipialWind.N;
  private readonly NE = PrincipialWind.NE;
  private readonly W = PrincipialWind.W;
  private readonly E = PrincipialWind.E;
  private readonly SW = PrincipialWind.SW;
  private readonly S = PrincipialWind.S;
  private readonly SE = PrincipialWind.SE;

  @Input() area: any;
  @Input() show: boolean;
  @Output() mousedown: EventEmitter<IHandleMouseDown> =
    new EventEmitter<IHandleMouseDown >();

  private onHandleMouseDown(event: any, handle: PrincipialWind) {
    const e : IHandleMouseDown = {
      handle: handle, attachment: event
    }
    this.mousedown.emit(e);
  }
}
