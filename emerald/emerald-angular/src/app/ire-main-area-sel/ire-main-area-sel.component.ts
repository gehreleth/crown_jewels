import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { ElementRef } from '@angular/core';

import { SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-ire-main-area-sel',
  styles : [],
  template: `
<div class="select-areas-outline" [ngStyle]="outlineStyles"></div>
<div class="select-areas-background-area"
     [style.background]="sanitizedAreaBackgroundStyles"
     [ngStyle]="areaBackgroundOtherStyles">
</div>
`
})
export class IreMainAreaSelComponent {
  @Input() imageHref: SafeUrl;
  @Input() area: any;
  @Input() outerWidth: number;
  @Input() outerHeight: number;

  constructor(private _sanitizer: DomSanitizer) { }

  private get outlineStyles(): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'default',
               'width': `${this.area.width}px`,
               'height': `${this.area.height}px`,
               'left': `${this.area.x}px`,
               'top': `${this.area.y}px`,
               'z-index': 0 };
  }

  private get sanitizedAreaBackgroundStyles() : SafeStyle {
    const url = this._sanitizer.sanitize(SecurityContext.URL, this.imageHref);
    return this._sanitizer.bypassSecurityTrustStyle('rgb(255, 255, 255)'
      + ` url("${url}")`
      + ` no-repeat scroll -${this.area.x + 1}px -${this.area.y + 1}px`
      + ` / ${this.outerWidth}px ${this.outerHeight}px`);
  }

  private get areaBackgroundOtherStyles(): any {
    return {   'position': 'absolute',
               'cursor': 'move',
               'left': `${this.area.x + 1}px`,
               'top': `${this.area.y + 1}px`,
               'width': `${this.area.width - 2}px`,
               'height': `${this.area.height - 2}px`,
               'z-index': 2 };
  }
}
