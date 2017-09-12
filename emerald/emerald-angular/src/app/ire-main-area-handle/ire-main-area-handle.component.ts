import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Action } from '../ire-main-area/action'

const HandlerSize: number = 8;
interface HandlerStyles { 'left': number, 'top': number, 'cursor': string };

@Component({
  selector: 'app-ire-main-area-handle',
  styles : [],
  template: `
<div class="{{handlerClass}}"
     [ngStyle]="areaResizeHandlerStyles"
     (mousedown)="onMouseDown($event)">
</div>`
})
export class IreMainAreaHandleComponent {
  @Input() action: Action;
  @Input() area: any;
  @Output() mousedown: EventEmitter<any> = new EventEmitter<any>();

  private onMouseDown(event: any) {
    this.mousedown.emit(event);
  }

  private get handlerClass(): string {
    let str: string;
    switch(this.action) {
      case Action.ScaleNW:
        str = 'nw';
        break;
      case Action.ScaleN:
        str = 'n';
        break;
      case Action.ScaleNE:
        str = 'ne';
        break;
      case Action.ScaleW:
        str = 'w';
        break;
      case Action.ScaleE:
        str = 'e';
        break;
      case Action.ScaleSW:
        str = 'sw';
        break;
      case Action.ScaleS:
        str = 's';
        break;
      case Action.ScaleSE:
        str = 'se';
        break;
      default:
        throw 'Bad case';
    }
    return `select-areas-resize-handler ${str}`;
  }

  private get areaResizeHandlerStyles(): any {
    const hs = IreMainAreaHandleComponent.rhc(this.action, this.area);
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': hs.cursor,
               'left': `${hs.left}px`,
               'top': `${hs.top}px`,
               'z-index': 101 };
  }

  private static rhc(action: Action, area: any): HandlerStyles {
    let top: number;
    let left: number;
    let pw: string;
    let semiwidth = Math.round(HandlerSize / 2);
    let semiheight = Math.round(HandlerSize / 2);
    switch(action) {
      case Action.ScaleNW:
        top = -semiheight;
        left = -semiwidth;
        pw = 'nw-resize';
        break;
      case Action.ScaleN:
        top = -semiheight;
        left = Math.round(area.width / 2) - semiwidth - 1;
        pw = 'n-resize';
        break;
      case Action.ScaleNE:
        top = -semiheight;
        left = area.width - semiwidth - 1;
        pw = 'ne-resize';
        break;
      case Action.ScaleW:
        top = Math.round(area.height / 2) - semiheight - 1;
        left = -semiwidth;
        pw = 'w-resize';
        break;
      case Action.ScaleE:
        top = Math.round(area.height / 2) - semiheight - 1;
        left = area.width - semiwidth - 1;
        pw = 'e-resize';
        break;
      case Action.ScaleSW:
        top = area.height - semiheight - 1;
        left = -semiwidth;
        pw = 'sw-resize';
        break;
      case Action.ScaleS:
        top = area.height - semiheight - 1;
        left = Math.round(area.width / 2) - semiwidth - 1;
        pw = 's-resize';
        break;
      case Action.ScaleSE:
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
