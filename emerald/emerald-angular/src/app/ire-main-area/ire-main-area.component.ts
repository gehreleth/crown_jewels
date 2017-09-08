import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { PrincipialWind } from '../ire-main-area-handle/ire-main-area-handle.component'
import { IImageMeta, Rotation } from '../image-meta';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-ire-main-area',
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss'],
})
export class IreMainAreaComponent implements OnInit {
  private readonly NW = PrincipialWind.NW;
  private readonly N = PrincipialWind.N;
  private readonly NE = PrincipialWind.NE;
  private readonly W = PrincipialWind.W;
  private readonly E = PrincipialWind.E;
  private readonly SW = PrincipialWind.SW;
  private readonly S = PrincipialWind.S;
  private readonly SE = PrincipialWind.SE;

  @Input() areas: Array<any>;
  @Output() areasChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @Input() selectedArea: number = 0;
  @Output() selectedAreaChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() imageHref: SafeUrl;
  @Input() width: number;
  @Input() height: number;

  constructor(private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  private onSelectionMouseDown(event: any, ix: number): void {
  }

  private onSelectionMouseMove(event: any, ix: number): void {
  }

  private onSelectionMouseUp(event: any, ix: number): void {
    this.selectedArea = ix;
    this.selectedAreaChanged.emit(this.selectedArea);
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
