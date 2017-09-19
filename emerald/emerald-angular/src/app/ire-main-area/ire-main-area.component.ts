import { Component, OnInit, Input, Output, EventEmitter, OnChanges,
  SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { Action } from './action';
import { IArea } from './area';
import { IScaleEvent } from './ire-main-area-handlers/ire-main-area-handlers.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const MinSelectionWidth = 30;
const MinSelectionHeight = 30;

interface IActionContext {
  action: Action, selection: number, area?: any, originatingEvent?: any
}

@Component({
  selector: 'app-ire-main-area',
  styles : [`
.blurred {
	filter: url("/filters.svg#blur3px");
	-webkit-filter: blur(3px);
	-moz-filter: blur(3px);
	-o-filter: blur(3px);
	filter: blur(3px);
}

.select-areas-overlay {
	background-color: #000;
	overflow: hidden;
	position: absolute;
}
`],
  template: `
<div [ngStyle]="topLevelStyles">
  <div *ngIf="atLeastOneSelection; else noselection">
    <img class="blurred"
         [src]="imageHref"
         [ngStyle]="imgStyles"
         [width]="width"
         [height]="height">
    <div class="select-areas-overlay" [ngStyle]="overlayStyles"></div>
    <div [ngStyle]="backgroundStyles"
         (mousedown) = "onNewSelectionStart($event)">
    </div>
  </div>
  <ng-template #noselection>
    <img [src]="imageHref"
         [width]="width"
         [height]="height"
         [ngStyle]="imgNoSelectionStyles"
         (mousedown) = "onNewSelectionStart($event)">
  </ng-template>
  <div *ngFor="let area of areas; let ix = index">
    <app-ire-main-area-sel
         [imageHref] ="imageHref"
         [area] = "area"
         [outerWidth] = "width"
         [outerHeight] = "height"
         (mousedown) = "onSelectionDragStart($event, ix)">
    </app-ire-main-area-sel>
    <i *ngIf="showHandles(ix)">
      <app-ire-main-area-handlers
          [area]="area"
          (onScale) = "onScaleStart($event, ix)">
      </app-ire-main-area-handlers>
      <app-ire-main-area-delete
          [area]="area"
          (click) = "onDelete($event, ix)">
      </app-ire-main-area-delete>
    </i>
  </div>
  <app-ire-main-area-action-layer
         [outerWidth]="width"
         [outerHeight]="height"
         [action]="currentAction"
         (mousedown)="onActionLayerMouseDown($event)"
         (mousemove)="onActionLayerMouseMove($event)"
         (mouseup)="onActionLayerMouseUp($event)">
  </app-ire-main-area-action-layer>
</div>`
})
export class IreMainAreaComponent implements OnChanges {
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

  @Input() areas: Array<IArea>;
  @Output() areasChanged: EventEmitter<Array<IArea>> =
    new EventEmitter<Array<IArea>>();

  @Input() selectedArea: number = 0;
  @Output() selectedAreaChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() imageHref: SafeUrl;
  @Input() width: number;
  @Input() height: number;

  private actionContext: IActionContext = null;

  constructor(private _sanitizer: DomSanitizer)
  { }

  // XXX: this construct is too verbose to do a basically simple thing
  // - to reset the current selection selection when source image is about to change.
  ngOnChanges(changes: SimpleChanges) {
    const imageHrefChange = changes['imageHref'];
    if (imageHrefChange) {
      const previousHref = !imageHrefChange.firstChange
        ? this.sanitizeUrl(imageHrefChange.previousValue)
        : null;
      const currentHref = this.sanitizeUrl(imageHrefChange.currentValue);
      if (currentHref !== previousHref) {
        this.selectedArea = -1;
        this.selectedAreaChanged.emit(this.selectedArea);
      }
    }
  }

  private sanitizeUrl(arg: SafeUrl) : string {
    return this._sanitizer.sanitize(SecurityContext.URL, arg);
  }

  private onNewSelectionStart(event: any): void {
    const area: IArea = {
      x: event.layerX, y: event.layerY, width: 0, height: 0, attachment: null
    }
    this.areas = this.areas.concat([area]);
    this.areasChanged.emit(this.areas);
    const selection = this.areas.length - 1;
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const actionContext: IActionContext = {
      action: Action.Add,
      selection: this.selectedArea,
      area: { ...area },
      originatingEvent: event
    }
    this.actionContext = actionContext;
  }

  private onSelectionDragStart(event: any, selection: number): void {
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const area = this.areas[this.selectedArea];
    const actionContext: IActionContext = {
      action: Action.Select,
      selection: this.selectedArea,
      area: { ...area },
      originatingEvent: event
    }
    this.actionContext = actionContext;
  }

  private onScaleStart(event: IScaleEvent, selection: number): void {
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const area = this.areas[this.selectedArea];
    const actionContext: IActionContext = {
      action: event.action,
      selection: this.selectedArea,
      area: { ...area },
      originatingEvent: event.nestedEvent
    }
    this.actionContext = actionContext;
  }

  private onDelete(event: any, selection: number): void {
    this.areas.splice(selection, 1);
    this.areasChanged.emit(this.areas);
    this.selectedArea = -1;
    this.selectedAreaChanged.emit(this.selectedArea);
  }

  private onActionLayerMouseDown(event: any): void {
    this.actionContext = this.rollbackAction(this.actionContext, event);
    this.areasChanged.emit(this.areas);
  }

  private onActionLayerMouseMove(event: any): void {
    this.actionContext = this.updateActionContext(this.actionContext, event);
  }

  private onActionLayerMouseUp(event: any): void {
    this.actionContext =
      this.commitAction(
        this.updateActionContext(this.actionContext, event), event);
    this.areasChanged.emit(this.areas);
  }

  private rollbackAction(context: IActionContext, event: any): IActionContext {
    return null; // It is possible to put previous area at its most recent place
                 // from context here, but it's not necessary yet.
  }

  private commitAction(context: IActionContext, event: any): IActionContext {
    return null; // Just switch this to NoAction state
  }

  private updateActionContext(oldContext: IActionContext, event: any): IActionContext {
    const oldContextAction = oldContext ? oldContext.action : Action.NoAction;
    switch (oldContextAction) {
      case Action.Add:
        return this.updateScaleSCtx(Action.Add, oldContext, event);
      case Action.Select:   // fall through
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
        return null;
    }
  }

  private updateMoveSCtx(oldContext: IActionContext, event: any): IActionContext {
    const deltaX = event.x - oldContext.originatingEvent.x;
    const deltaY = event.y - oldContext.originatingEvent.y;
    const x = Math.min(this.width - oldContext.area.width,
      Math.max(oldContext.area.x + deltaX, 0));
    const y = Math.min(this.height - oldContext.area.height,
      Math.max(oldContext.area.y + deltaY, 0));
    this.areas[oldContext.selection] = {x: x, y: y,
      width: oldContext.area.width, height: oldContext.area.height,
      attachment: oldContext.area.attachment
    };
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
      width: right - left, height: bottom - top,
      attachment: oldContext.area.attachment };
    this.areasChanged.emit(this.areas);
    const retVal: IActionContext = {
      action: action, selection: oldContext.selection,
      area: oldContext.area, originatingEvent: oldContext.originatingEvent
    }
    return retVal;
  }

  private get currentAction(): Action {
    const val = this.actionContext;
    return val ? val.action : Action.NoAction;
  }

  private showHandles(selection: number) : boolean {
    return Action.NoAction === this.currentAction &&
           selection === this.selectedArea;
  }

  private get atLeastOneSelection() : boolean {
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
