import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PrincipialWind } from '../ire-main-area-handle/ire-main-area-handle.component';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { IImageMeta, Rotation } from '../image-meta';
import { Action } from '../ire-main-area-action-layer/ire-main-area-action-layer.component';
import { IHandleMouseDown } from '../ire-main-area-handlers/ire-main-area-handlers.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  @Output() areasChanged: EventEmitter< Array<any> > = new EventEmitter< Array<any> >();

  @Input() selectedArea: number = 0;
  @Output() selectedAreaChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() imageHref: SafeUrl;
  @Input() width: number;
  @Input() height: number;

  private currentActionSubj: BehaviorSubject<Action> = new BehaviorSubject<Action>(Action.NoAction);

  private onOutsideSelectionMouseDown(event: any): void {
    this.currentActionSubj.next(Action.Add);
  }

  private onSelectionMouseDown(event: any, ix: number): void {
    this.currentActionSubj.next(Action.Select);
  }

  private onHandlerMouseDown(event: any, ix: number): void {
    const event0 = event as IHandleMouseDown;
    this.currentActionSubj.next(Action.ScaleNW);
  }

  private onActionLayerMouseDown(event: any): void {
    this.currentActionSubj.next(Action.NoAction);
  }

  private onActionLayerMouseOut(event: any): void {
    this.currentActionSubj.next(Action.NoAction);
  }

  private onActionLayerMouseMove(event: any): void {
  }

  private onActionLayerMouseUp(event: any): void {
    this.currentActionSubj.next(Action.NoAction);
  }

  private get actionLayerState(): boolean {
    return this.currentActionSubj.getValue() !== Action.NoAction;
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
