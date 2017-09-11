import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PrincipialWind } from '../ire-main-area-handle/ire-main-area-handle.component';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { IImageMeta, Rotation } from '../image-meta';
import { Action } from '../ire-main-area-action-layer/ire-main-area-action-layer.component';
import { IHandleMouseDown } from '../ire-main-area-handlers/ire-main-area-handlers.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss'],
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
    let newArea = {
      x: event.layerX, y: event.layerY, width: 100, height: 100
    }
    this.areas = this.areas.concat([newArea]);
    this.areasChanged.emit(this.areas);
    const selection = this.areas.length - 1;
    this.selectedArea = selection;
    this.selectedAreaChanged.emit(this.selectedArea);
    const actionContext: IActionContext = {
      action: Action.Add,
      selection: selection,
      area: { ...newArea },
      originatingEvent: event
    }
    this.currentActionSubj.next(actionContext);
  }

  private onSelectionMouseDown(event: any, ix: number): void {
    this.selectedArea = ix;
    this.selectedAreaChanged.emit(this.selectedArea);
    const area = this.areas[this.selectedArea];
    const actionContext: IActionContext = {
      action: Action.Select,
      selection: this.selectedArea,
      area: { ...area },
      originatingEvent: event
    }
    this.currentActionSubj.next(actionContext);
  }

  private onHandlerMouseDown(event: any, ix: number): void {
    const handleMouseDown = event as IHandleMouseDown;
    let action: Action;
    switch (handleMouseDown.handle) {
      case PrincipialWind.NW:
        action = Action.ScaleNW;
        break;
      case PrincipialWind.N:
        action = Action.ScaleN;
        break;
      case PrincipialWind.NE:
        action = Action.ScaleNE;
        break;
      case PrincipialWind.W:
        action = Action.ScaleW;
        break;
      case PrincipialWind.E:
        action = Action.ScaleE;
        break;
      case PrincipialWind.SW:
        action = Action.ScaleSW;
        break;
      case PrincipialWind.S:
        action = Action.ScaleS;
        break;
      case PrincipialWind.SE:
        action = Action.ScaleSE;
        break;
      default:
        this.currentActionSubj.next(IActionContext.initial());
    }
    this.selectedArea = ix;
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
    this.completeAction(actionContext);
    this.currentActionSubj.next(IActionContext.initial());
  }

  private updateActionContext(oldContext: IActionContext, event: any): IActionContext {
    switch (oldContext.action) {
      case Action.Add:
        return this.updateAddSCtx(oldContext, event);
      case Action.Select: // fall through
      case Action.Move:
        return this.updateMoveSCtx(oldContext, event);
      default:
        return IActionContext.initial();
    }
  }

  private updateAddSCtx(oldContext: IActionContext, event: any): IActionContext {
    const deltaX = oldContext.originatingEvent.x - event.x;
    const deltaY = oldContext.originatingEvent.y - event.y;
    const left = Math.min(oldContext.area.x, oldContext.area.x - deltaX);
    const right = Math.max(oldContext.area.x, oldContext.area.x - deltaX);
    const top = Math.min(oldContext.area.y, oldContext.area.y - deltaY);
    const bottom = Math.max(oldContext.area.y, oldContext.area.y - deltaY);
    this.areas[oldContext.selection] = {x: left,
      y: top, width: right - left, height: bottom - top};
    this.areasChanged.emit(this.areas);
    const retVal: IActionContext = {
      action: Action.Add,
      selection: oldContext.selection,
      area: oldContext.area,
      originatingEvent: oldContext.originatingEvent
    }
    return retVal;
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

  private completeAction(context: IActionContext): void {
  }

  private get actionLayerState(): boolean {
    return this.currentActionSubj.getValue().action !== Action.NoAction;
  }

  private showHandles(ix: number) : boolean {
    return !this.actionLayerState && ix === this.selectedArea;
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
