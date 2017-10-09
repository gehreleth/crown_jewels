import { Component, OnChanges, Input } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';

import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IDimensions } from '../../util/dimensions';
import { IRect } from '../../util/rect';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-ire-bs-image',
  styles : [`
#outer {
  width: auto;
  height: auto;
  overflow: hidden;
}

.select-areas-overlay {
  background-color: #000;
  overflow: hidden;
  position: absolute;
}

.select-areas-outline {
	background: #fff url('data:image/gif;base64,R0lGODlhCAAIAJECAAAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBgACACwAAAAACAAIAAACDYQhKadrzVRMB9FZ5SwAIfkECQYAAgAsAAAAAAgACAAAAgeUj6nL7V0AACH5BAUGAAIALAAAAAAIAAgAAAIPFA6imGrnXlvQocjspbUAACH5BAkGAAIALAAAAAAIAAgAAAIHlI+py+1dAAAh+QQFBgACACwAAAAACAAIAAACD5SAYJeb6tBi0LRYaX2iAAAh+QQJBgACACwAAAAACAAIAAACB5SPqcvtXQAAIfkEBQYAAgAsAAAAAAgACAAAAg+UgWCSernaYmjCWLF7qAAAIfkEBQYAAgAsAAAAAAEAAQAAAgJUAQAh+QQJBgACACwAAAAACAAIAAACB5SPqcvtXQAAIfkEBQYAAgAsAAAAAAgACAAAAg2UBQmna81UTAfRWeUsACH5BAkGAAIALAAAAAAIAAgAAAIHlI+py+1dAAAh+QQFBgACACwAAAAACAAIAAACD4QuoJhq515b0KHI7KW1AAAh+QQJBgACACwAAAAACAAIAAACB5SPqcvtXQAAIfkEBQYAAgAsAAAAAAgACAAAAg8EhGKXm+rQYtC0WGl9oAAAIfkEBQ0AAgAsAAAAAAEAAQAAAgJUAQA7');
	overflow: hidden;
}
`],
  template: `
<div [ngStyle]="_topLevelStyles">
  <img [src]="_fragmentHref"
       [ngStyle]="_imgStyles"
       [width]="width"
       [height]="height">
  <div class="select-areas-overlay" [ngStyle]="_overlayStyles"></div>
  <div [ngStyle]="_backgroundStyles"></div>
  <div class="select-areas-outline" [ngStyle]="_outlineStyles"></div>
  <div class="select-areas-background-area"
       [style.background]="_sanitizedAreaBackgroundStyles"
       [ngStyle]="_areaBackgroundOtherStyles">
  </div>
  <div class="border border-primary" [ngStyle]="_borderStyles"></div>
</div>
`})
export class IreBsImageComponent implements OnChanges {
  @Input() imageMeta: IImageMeta;
  @Input() region: IImageRegion;
  @Input() dimensions: IDimensions;

  @Input() width: number;
  @Input() height: number;

  private _croppedAreaCached: IRect;
  private _selectionAreaCached: IRect;
  private _fragmentHrefCached: SafeUrl;
  private _sanitizedAreaBackgroundStylesCached: SafeStyle;

  constructor(private _sanitizer: DomSanitizer)
  { }

  ngOnChanges() {
    this._croppedAreaCached = null;
    this._selectionAreaCached = null;
    this._fragmentHrefCached = null;
    this._sanitizedAreaBackgroundStylesCached = null;
  }

  private get _fragmentHref(): SafeUrl {
    if (!this._fragmentHrefCached) {
      this._fragmentHrefCached = this._sanitizer.bypassSecurityTrustUrl(
        getBlobUrl(this.imageMeta, this._croppedArea))
    }
    return this._fragmentHrefCached;
  }

  private get _croppedArea(): IRect {
    if (!this._croppedAreaCached) {
      const val: IRect = {
        x: getCropX(this.region, this.dimensions),
        y: getCropY(this.region, this.dimensions),
        width: getCropWidth(this.region, this.dimensions),
        height: getCropHeight(this.region, this.dimensions)
      };
      this._croppedAreaCached = val;
    }
    return this._croppedAreaCached;
  }

  private get _selectionArea(): IRect {
    if (!this._selectionAreaCached) {
      const outer = this._croppedArea;
      const scaleX = this.width / outer.width;
      const scaleY = this.height / outer.height;
      const val: IRect = {
        x: Math.floor(scaleX * (this.region.x - outer.x)),
        y: Math.floor(scaleY * (this.region.y - outer.y)),
        width: Math.floor(scaleX * this.region.width),
        height: Math.floor(scaleY * this.region.height)
      };
      this._selectionAreaCached = val;
    }
    return this._selectionAreaCached;
  }

  private get _topLevelStyles(): any {
    return {   'display': 'inline-block',
               'position': 'relative',
               'width': `${this.width}px`,
               'height': `${this.height}px` };
  }

  private get _imgStyles(): any {
    return {   'position': 'absolute' };
  }

  private get _overlayStyles(): any {
    return {   'opacity': 0.2,
               'position': 'absolute',
               'width': `${this.width}px`,
               'height': `${this.height}px`,
               'display': 'block' };
  }

  private get _backgroundStyles(): any {
    return {   'background-color': 'rgb(0, 0, 0)',
               'opacity': 0,
               'position': 'absolute',
               'width': `${this.width}px`,
               'height': `${this.height}px` };
  }

  private get _outlineStyles(): any {
    return {   'opacity': 0.5,
               'position': 'absolute',
               'cursor': 'default',
               'width': `${this._selectionArea.width}px`,
               'height': `${this._selectionArea.height}px`,
               'left': `${this._selectionArea.x}px`,
               'top': `${this._selectionArea.y}px`,
               'z-index': 0 };
  }

  private get _sanitizedAreaBackgroundStyles() : SafeStyle {
    if (!this._sanitizedAreaBackgroundStylesCached) {
      const val = this._sanitizer.bypassSecurityTrustStyle('rgb(255, 255, 255)'
        + ` url("${getBlobUrl(this.imageMeta, this._croppedArea)}")`
        + ` no-repeat scroll -${this._selectionArea.x + 1}px`
        + ` -${this._selectionArea.y + 1}px`
        + ` / ${this.width}px ${this.height}px`);
      this._sanitizedAreaBackgroundStylesCached = val;
    }
    return this._sanitizedAreaBackgroundStylesCached;
  }

  private get _areaBackgroundOtherStyles(): any {
    return {   'position': 'absolute',
               'left': `${this._selectionArea.x + 1}px`,
               'top': `${this._selectionArea.y + 1}px`,
               'width': `${this._selectionArea.width - 2}px`,
               'height': `${this._selectionArea.height - 2}px`,
               'z-index': 2
    };
  }

  private get _borderStyles(): any {
    return {
      'position': 'absolute',
      'left': '0px',
      'top': '0px',
      'width': `${this.width}px`,
      'height': `${this.height}px`,
      'z-index': 3
    };
  }
}

function getCropX(region: IImageRegion, dimensions: IDimensions): number {
  const width = getCropWidth(region, dimensions);
  const halfWidth = width * .5;
  const rectCenterX = region.x + (region.width * .5);
  const rightBound = Math.min(dimensions.naturalWidth, rectCenterX + halfWidth);
  return Math.floor(Math.max(0, rightBound - width));
}

function getCropY(region: IImageRegion, dimensions: IDimensions): number {
  const height = getCropHeight(region, dimensions);
  const halfHeight = height * .5;
  const rectCenterY = region.y + region.height * .5;
  const bottomBound = Math.min(dimensions.naturalHeight, rectCenterY + halfHeight);
  return Math.floor(Math.max(0, bottomBound - height));
}

function getCropWidth(region: IImageRegion, dimensions: IDimensions): number {
  return Math.floor(Math.max(region.width, region.height) * 1.2);
}

function getCropHeight(region: IImageRegion, dimensions: IDimensions): number {
  return Math.floor(Math.max(region.width, region.height) * 1.2);
}
