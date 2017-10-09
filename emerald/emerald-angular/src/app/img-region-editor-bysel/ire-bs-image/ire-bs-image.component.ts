import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';

import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IDimensions } from '../../util/dimensions';
import { IRect } from '../../util/rect';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-ire-bs-image',
  template: `
    <img [src]="_fragmentHref" width="{{_width}}" height="{{_height}}">
  `
})
export class IreBsImageComponent {
  static readonly _WIDTH = 300;
  static readonly _HEIGHT = 300;

  private readonly _width = IreBsImageComponent._WIDTH;
  private readonly _height = IreBsImageComponent._HEIGHT;

  @Input() imageMeta: IImageMeta;
  @Input() region: IImageRegion;
  @Input() dimensions: IDimensions;

  constructor(private _sanitizer: DomSanitizer)
  { }

  private get _fragmentHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(this.imageMeta, this._croppedArea));
  }

  private get _croppedArea(): IRect {
    const retVal: IRect = {
      x: getCropX(this.region, this.dimensions),
      y: getCropY(this.region, this.dimensions),
      width: getCropWidth(this.region, this.dimensions),
      height: getCropHeight(this.region, this.dimensions)
    };
    return retVal;
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
  const factor = IreBsImageComponent._WIDTH / IreBsImageComponent._HEIGHT;
  return Math.floor(Math.max(region.width, region.height) * factor * 1.2);
}

function getCropHeight(region: IImageRegion, dimensions: IDimensions): number {
  const factor = IreBsImageComponent._HEIGHT / IreBsImageComponent._WIDTH;
  return Math.floor(Math.max(region.width, region.height) * factor * 1.2);
}
