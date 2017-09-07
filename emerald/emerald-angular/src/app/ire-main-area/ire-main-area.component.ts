import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { IImageMeta, Rotation } from '../image-meta';

const HandlerSize: number = 8;
enum PrincipialWind { NW, N, NE, W, E, SW, S, SE };
interface HandlerStyles { 'left': number, 'top': number, 'cursor': string };

function rhc(show: PrincipialWind, area: any): HandlerStyles {
  let top: number;
  let left: number;
  let pw: string;
  let semiwidth = Math.round(HandlerSize / 2);
  let semiheight = Math.round(HandlerSize / 2);
  switch(show) {
    case PrincipialWind.NW:
      top = -semiheight;
      left = -semiwidth;
      pw = 'nw-resize';
      break;
    case PrincipialWind.N:
      top = -semiheight;
      left = Math.round(area.width / 2) - semiwidth - 1;
      pw = 'n-resize';
      break;
    case PrincipialWind.NE:
      top = -semiheight;
      left = area.width - semiwidth - 1;
      pw = 'ne-resize';
      break;
    case PrincipialWind.W:
      top = Math.round(area.height / 2) - semiheight - 1;
      left = -semiwidth;
      pw = 'w-resize';
      break;
    case PrincipialWind.E:
      top = Math.round(area.height / 2) - semiheight - 1;
      left = area.width - semiwidth - 1;
      pw = 'e-resize';
      break;
    case PrincipialWind.SW:
      top = area.height - semiheight - 1;
      left = -semiwidth;
      pw = 'sw-resize';
      break;
    case PrincipialWind.S:
      top = area.height - semiheight - 1;
      left = Math.round(area.width / 2) - semiwidth - 1;
      pw = 's-resize';
      break;
    case PrincipialWind.SE:
      top = area.height - semiheight - 1;
      left = area.width - semiwidth - 1;
      pw = 'se-resize';
      break;
    default:
      throw "Bad case";
  }
  const retVal: HandlerStyles = { 'left': area.x + left,
  'top': area.y + top,
  'cursor': pw }
  return retVal;
}

@Component({
  selector: 'app-ire-main-area',
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss']
})
export class IreMainAreaComponent {
  public principialWind = PrincipialWind;
  @Input() Areas: Array<any>;
  @Output() AreasChanged: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @Input() SelectedArea: number = 0;
  @Output() SelectedAreaChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() ImageHref: SafeUrl;
  @Input() Width: number;
  @Input() Height: number;

  constructor(private _sanitizer: DomSanitizer) { }

  private topLevelStyles(): any {
    return {   'position': 'relative',
               'width': `${this.Width}px`,
               'height': `${this.Height}px` };
  }

  private imgStyles(): any {
    return {   'position': 'absolute' };
  }

  private overlayStyles(): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'width': `${this.Width}px`,
               'height': `${this.Height}px`,
               'display': 'block' };
  }

  private backgroundStyles(): any {
    return {   'background-color': 'rgb(0, 0, 0)',
               'opacity': 0,
               'position': 'absolute',
               'width': `${this.Width}}px`,
               'height': `${this.Height}px`,
               'cursor': 'crosshair' };
  }

  private outlineStyles(area: any): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'default',
               'width': `${area.width}px`,
               'height': `${area.height}px`,
               'left': `${area.x}px`,
               'top': `${area.y}px`,
               'z-index': 0 };
  }

  private sanitizedAreaBackgroundStyles(area: any) : SafeStyle {
    let url = this._sanitizer.sanitize(SecurityContext.URL, this.ImageHref);
    return this._sanitizer.bypassSecurityTrustStyle('rgb(255, 255, 255)'
      + ` url("${url}")`
      + ` no-repeat scroll -${area.x + 1}px -${area.y + 1}px `
      + `/ ${this.Width}px ${this.Height}px`);
  }

  private areaBackgroundOtherStyles(area: any): any {
    return {   'position': 'absolute',
               'cursor': 'move',
               'width': `${area.width - 2}px`,
               'height': `${area.height - 2}px`,
               'left': `${area.x + 1}px`,
               'top': `${area.y + 1}px`,
               'z-index': 2 };
  }

  private areaResizeHandlerStyles(area: any, pw: PrincipialWind): any {
    const hs = rhc(pw, area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': hs.cursor,
               'left': `${hs.left}px`,
               'top': `${hs.top}px`,
               'z-index': 101 };
  }

  private areaDeleteStyles(area: any): any {
    const hs = rhc(PrincipialWind.NE, area);
    return {   'left': `${hs.left + 4}px`,
               'top': `${hs.top - 22}px`,
               'position': 'absolute',
               'z-index': 1 };
  }
}
