import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { IImageMeta, Rotation } from '../image-meta';

const HandlerSize: number = 8;
enum HP { NW, N, NE, W, E, SW, S, SE };
interface Coords { 'left':number, 'top':number };

function rhc(show: HP, area: any): Coords {
  let top: number;
  let left: number;
  let semiwidth = Math.round(HandlerSize / 2);
  let semiheight = Math.round(HandlerSize / 2);
  switch(show) {
    case HP.NW:
      top = -semiheight;
      left = -semiwidth;
      break;
    case HP.N:
      top = -semiheight;
      left = Math.round(area.width / 2) - semiwidth - 1;
      break;
    case HP.NE:
      top = -semiheight;
      left = area.width - semiwidth - 1;
      break;
    case HP.W:
      top = Math.round(area.height / 2) - semiheight - 1;
      left = -semiwidth;
      break;
    case HP.E:
      top = Math.round(area.height / 2) - semiheight - 1;
      left = area.width - semiwidth - 1;
      break;
    case HP.SW:
      top = area.height - semiheight - 1;
      left = -semiwidth;
      break;
    case HP.S:
      top = area.height - semiheight - 1;
      left = Math.round(area.width / 2) - semiwidth - 1;
      break;
    case HP.SE:
      top = area.height - semiheight - 1;
      left = area.width - semiwidth - 1;
      break;
    default:
      throw "Bad case";
  }
  const retVal: Coords = { left: area.x + left, top: area.y + top }
  return retVal;
}

@Component({
  selector: 'app-ire-main-area',
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss']
})
export class IreMainAreaComponent {
  @Input() Areas: Array<any>;
  @Output() AreasChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @Input() SelectedArea: number = 0;
  @Output() SelectedAreaChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() ImageHref: string;
  @Input() Width: number;
  @Input() Height: number;

  constructor(private sanitizer: DomSanitizer) { }

  get ImageHrefSanitized(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(this.ImageHref);
  }

  topLevelStyle(): any {
    return {   'position': 'relative',
               'width': `${this.Width}px`,
               'height': `${this.Height}px` };
  }

  imgStyle(): any {
    return {   'position': 'absolute' };
  }

  overlayStyle(): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'width': `${this.Width}px`,
               'height': `${this.Height}px`,
               'display': 'block' };
  }

  backgroundStyle(): any {
    return {   'background-color': 'rgb(0, 0, 0)',
               'opacity': 0,
               'position': 'absolute',
               'width': `${this.Width}}px`,
               'height': `${this.Height}px`,
               'cursor': 'crosshair' };
  }

  outlineStyle(area: any): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'default',
               'width': `${area.width}px`,
               'height': `${area.height}px`,
               'left': `${area.x}px`,
               'top': `${area.y}px`,
               'z-index': 0 };
  }

  sanitizedAreaBackground(area: any) : SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('rgb(255, 255, 255)'
      + ` url("${this.ImageHref}")`
      + ` no-repeat scroll -${area.x + 1}px -${area.y + 1}px `
      + `/ ${this.Width}px ${this.Height}px`);
  }

  areaBackgroundOther(area: any): any {
    return {   'position': 'absolute',
               'cursor': 'move',
               'width': `${area.width - 2}px`,
               'height': `${area.height - 2}px`,
               'left': `${area.x + 1}px`,
               'top': `${area.y + 1}px`,
               'z-index': 2 };
  }

  areaResizeHandlerW(area: any): any {
    const pos = rhc(HP.W, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'w-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  // width: 60px; height: 100px; left: 10px; top: 20px;
  // 6px; top: 115px;
  areaResizeHandlerSW(area: any): any {
    const pos = rhc(HP.SW, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'sw-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  // width: 60px; height: 100px; left: 10px; top: 20px;
  // 35px; top: 115px;
  areaResizeHandlerS(area: any): any {
    const pos = rhc(HP.S, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 's-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  // width: 60px; height: 100px; left: 10px; top: 20px;
  // 35px; top: 115px;
  areaResizeHandlerSE(area: any): any {
    const pos = rhc(HP.SE, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'se-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  areaResizeHandlerE(area: any): any {
    const pos = rhc(HP.E, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'e-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  areaResizeHandlerNE(area: any): any {
    const pos = rhc(HP.NE, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'ne-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  areaResizeHandlerN(area: any): any {
    const pos = rhc(HP.N, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'n-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  areaResizeHandlerNW(area: any): any {
    const pos = rhc(HP.NW, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'nw-resize',
               'left': `${pos.left}px`,
               'top': `${pos.top}px`,
               'z-index': 101 };
  }

  areaDelete(area: any): any {
    const pos = rhc(HP.NE, area);
    return {   'left': `${pos.left + 4}px`,
               'top': `${pos.top - 22}px`,
               'position': 'absolute',
               'z-index': 1 };
  }
}
