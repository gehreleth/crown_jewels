import { Component, Input, Output, EventEmitter } from '@angular/core';

const HandlerSize: number = 8;
export enum PrincipialWind { NW, N, NE, W, E, SW, S, SE };
interface HandlerStyles { 'left': number, 'top': number, 'cursor': string };

@Component({
  selector: 'app-ire-main-area-handle',
  styles : [],
  template: `<div class="{{handlerClass}}" [ngStyle]="areaResizeHandlerStyles"></div>`
})
export class IreMainAreaHandleComponent {
  @Input() position: PrincipialWind;
  @Input() area: any;

  constructor() { }

  private get handlerClass(): string {
    return `select-areas-resize-handler ${PrincipialWind[this.position].toLowerCase()}`;
  }

  private get areaResizeHandlerStyles(): any {
    const hs = IreMainAreaHandleComponent.rhc(this.position, this.area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': hs.cursor,
               'left': `${hs.left}px`,
               'top': `${hs.top}px`,
               'z-index': 101 };
  }

  private static rhc(show: PrincipialWind, area: any): HandlerStyles {
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
    const retVal: HandlerStyles = {
      'left': area.x + left,
      'top': area.y + top,
      'cursor': pw
    }
    return retVal;
  }
}
