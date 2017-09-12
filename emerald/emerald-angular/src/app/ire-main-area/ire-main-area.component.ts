import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { IImageMeta, Rotation } from '../image-meta';
import { Action } from './action';
import { IHandleMouseDown } from '../ire-main-area-handlers/ire-main-area-handlers.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const MinSelectionWidth = 30;
const MinSelectionHeight = 30;

interface IActionContext {
  action: Action, selection: number, area?: any, originatingEvent?: any
}

namespace IActionContext {
  export function initial() : IActionContext {
    const retVal : IActionContext = {
      action: Action.NoAction,
      selection: -1
    }
    return retVal;
  }
}

@Component({
  selector: 'app-ire-main-area',
  styles : [],
  template: `
<div [ngStyle]="topLevelStyles">
  <i *ngIf="isSelectionsPresent; else noselection">
    <img class="blurred"
         [src]="imageHref"
         [ngStyle]="imgStyles"
         [width]="width"
         [height]="height">
    <div class="select-areas-overlay" [ngStyle]="overlayStyles"></div>
    <div [ngStyle]="backgroundStyles"
         (mousedown) = "onOutsideSelectionMouseDown($event)">
    </div>
  </i>
  <ng-template #noselection>
    <img [src]="imageHref"
         [width]="width"
         [height]="height"
         [ngStyle]="imgNoSelectionStyles"
         (mousedown) = "onOutsideSelectionMouseDown($event)">
  </ng-template>
  <i *ngFor="let area of areas; let ix = index">
    <app-ire-main-area-sel
         [imageHref] ="imageHref"
         [area] = "area"
         [outerWidth] = "width"
         [outerHeight] = "height"
         (mousedown) = "onSelectionMouseDown($event, ix)">
    </app-ire-main-area-sel>
    <i *ngIf="showHandles(ix)">
      <app-ire-main-area-handlers
         [area]="area"
         [show]="true"
         (mousedown) = "onHandlerMouseDown($event, ix)">
      </app-ire-main-area-handlers>
    </i>
  </i>
  <app-ire-main-area-action-layer
         [outerWidth]="width"
         [outerHeight]="height"
         [action]="currentAction"
         (mousedown)="onActionLayerMouseDown($event)"
         (mouseout)="onActionLayerMouseOut($event)"
         (mousemove)="onActionLayerMouseMove($event)"
         (mouseup)="onActionLayerMouseUp($event)">
  </app-ire-main-area-action-layer>
</div>`
})
export class IreMainAreaComponent {
  private readonly NoAction = Action.NoAction;
  private readonly Add = Action.Add;
  private readonly Select = Action.Select;
  private readonly Move = Action.Move;
  private readonly ScaleNW = Action.ScaleNW;
  private readonly ScaleN = Action.ScaleN;
  private readonly ScaleNE = Action.ScaleNE;
  private readonly ScaleW = Action.ScaleW;
  private readonly ScaleE = Action.ScaleE;
  private readonly ScaleSW = Action.ScaleSW;
  private readonly ScaleS = Action.ScaleS;
  private readonly ScaleSE = Action.ScaleSE;

  @Input() areas: Array<any>;
  @Output() areasChanged: EventEmitter< Array<any> > =
    new EventEmitter< Array<any> >();

  @Input() selectedArea: number = 0;
  @Output() selectedAreaChanged: EventEmitter<number> =
    new EventEmitter<number>();

  @Input() imageHref: SafeUrl;
  @Input() width: number;
  @Input() height: number;

  private readonly currentActionSubj: BehaviorSubject<IActionContext> =
    new BehaviorSubject<IActionContext>(IActionContext.initial());

  private onOutsideSelectionMouseDown(event: any): void {
    const area = {
      x: event.layerX, y: event.layerY, width: 0, height: 0
    }
    this.areas = this.areas.concat([area]);
    this.areasChanged.emit(this.areas);
    const selection = this.areas.length - 1;
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const actionContext: IActionContext = {
      action: Action.Add,
      selection: selection,
      area: { ...area },
      originatingEvent: event
    }
    this.currentActionSubj.next(actionContext);
  }

  private onSelectionMouseDown(event: any, selection: number): void {
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const area = this.areas[this.selectedArea];
    const actionContext: IActionContext = {
      action: Action.Select,
      selection: selection,
      area: { ...area },
      originatingEvent: event
    }
    this.currentActionSubj.next(actionContext);
  }

  private onHandlerMouseDown(event: any, selection: number): void {
    const handleMouseDown = event as IHandleMouseDown;
    const action = handleMouseDown.action;
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const area = this.areas[this.selectedArea];
    const actionContext: IActionContext = {
      action: action,
      selection: this.selectedArea,
      area: { ...area },
      originatingEvent: handleMouseDown.attachment
    }
    this.currentActionSubj.next(actionContext);
  }

  private onActionLayerMouseDown(event: any): void {
    this.currentActionSubj.next(IActionContext.initial());
  }

  private onActionLayerMouseOut(event: any): void {
    this.currentActionSubj.next(IActionContext.initial());
  }

  private onActionLayerMouseMove(event: any): void {
    const actionContext =
      this.updateActionContext(this.currentActionSubj.getValue(), event);
    this.currentActionSubj.next(actionContext);
  }

  private onActionLayerMouseUp(event: any): void {
    const actionContext =
      this.updateActionContext(this.currentActionSubj.getValue(), event);
    this.currentActionSubj.next(this.completeAction(actionContext));
  }

  private updateActionContext(oldContext: IActionContext, event: any): IActionContext {
    switch (oldContext.action) {
      case Action.Add:
        return this.updateScaleSCtx(Action.Add, oldContext, event);
      case Action.Select: // fall through
      case Action.Move:
        return this.updateMoveSCtx(oldContext, event);
      case Action.ScaleNW:  // fall through
      case Action.ScaleN:
      case Action.ScaleNE:
      case Action.ScaleW:
      case Action.ScaleE:
      case Action.ScaleSW:
      case Action.ScaleS:
      case Action.ScaleSE:
        return this.updateScaleSCtx(oldContext.action, oldContext, event);
      default:
        return IActionContext.initial();
    }
  }

  private updateMoveSCtx(oldContext: IActionContext, event: any): IActionContext {
    const deltaX = event.x - oldContext.originatingEvent.x;
    const deltaY = event.y - oldContext.originatingEvent.y;
    let x = Math.max(oldContext.area.x + deltaX, 0);
    let y = Math.max(oldContext.area.y + deltaY, 0);
    x = Math.min(this.width - oldContext.area.width, x);
    y = Math.min(this.height - oldContext.area.height, y);
    this.areas[oldContext.selection] = {x: x, y: y,
      width: oldContext.area.width, height: oldContext.area.height};
    this.areasChanged.emit(this.areas);
    const retVal: IActionContext = {
      action: Action.Move,
      selection: oldContext.selection,
      area: oldContext.area,
      originatingEvent: oldContext.originatingEvent
    }
    return retVal;
  }

  private updateScaleSCtx(action: Action, oldContext: IActionContext,
    event: any): IActionContext
  {
    const deltaX = event.x - oldContext.originatingEvent.x;
    const deltaY = event.y - oldContext.originatingEvent.y;
    let left = oldContext.area.x;
    let top = oldContext.area.y;
    let right = oldContext.area.x + oldContext.area.width;
    let bottom = oldContext.area.y + oldContext.area.height;
    switch(action) {
      case Action.ScaleNW:  // fall through
        left += deltaX;
        top += deltaY;
        break;
      case Action.ScaleN:
        top += deltaY;
        break;
      case Action.ScaleNE:
        right += deltaX;
        top += deltaY;
        break;
      case Action.ScaleW:
        left += deltaX;
        break;
      case Action.ScaleE:
        right += deltaX;
        break;
      case Action.ScaleSW:
        left += deltaX;
        bottom += deltaY;
        break;
      case Action.ScaleS:
        bottom += deltaY;
        break;
      case Action.Add: // fall through
      case Action.ScaleSE:
        bottom += deltaY;
        right += deltaX;
        break;
    }
    if (left > right) { [left, right] = [right, left]; }
    if (top > bottom) { [top, bottom] = [bottom, top]; }
    left = Math.max(0, left);
    top = Math.max(0, top);
    if (right - left < MinSelectionWidth) { right = left + MinSelectionWidth };
    if (bottom - top < MinSelectionHeight) { bottom = top + MinSelectionHeight };
    right = Math.min(this.width, right);
    bottom = Math.min(this.height, bottom);
    this.areas[oldContext.selection] = {x: left, y: top,
      width: right - left, height: bottom - top};
    this.areasChanged.emit(this.areas);
    const retVal: IActionContext = {
      action: action, selection: oldContext.selection,
      area: oldContext.area, originatingEvent: oldContext.originatingEvent
    }
    return retVal;
  }

  private completeAction(context: IActionContext): IActionContext {
    return IActionContext.initial();
  }

  private get currentAction(): Action {
    const val = this.currentActionSubj.getValue();
    return val ? val.action : Action.NoAction;
  }

  private showHandles(selection: number) : boolean {
    return Action.NoAction === this.currentAction &&
           selection === this.selectedArea;
  }

  private get isSelectionsPresent() : boolean {
    return this.areas && this.areas.length > 0;
  }

  private get topLevelStyles(): any {
    return {   'position': 'relative',
               'width': `${this.width}px`,
               'height': `${this.height}px` };
  }

  private get imgStyles(): any {
    return {   'position': 'absolute' };
  }

  private get imgNoSelectionStyles() {
    return {   'cursor': 'crosshair' };
  }

  private get overlayStyles(): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'width': `${this.width}px`,
               'height': `${this.height}px`,
               'display': 'block' };
  }

  private get backgroundStyles(): any {
    return {   'background-color': 'rgb(0, 0, 0)',
               'opacity': 0,
               'position': 'absolute',
               'width': `${this.width}px`,
               'height': `${this.height}px`,
               'cursor': 'crosshair' };
  }
}
