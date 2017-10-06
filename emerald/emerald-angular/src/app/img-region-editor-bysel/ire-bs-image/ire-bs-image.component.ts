import { Component, Input, OnInit } from '@angular/core';

import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';

import { IDimensions } from '../../browser/dimensions';

interface ICroppedArea {
  x: number, y: number, width: number, height: number
}

@Component({
  selector: 'app-ire-bs-image',
  templateUrl: './ire-bs-image.component.html',
  styleUrls: ['./ire-bs-image.component.scss']
})
export class IreBsImageComponent implements OnInit {
  private static readonly _WIDTH = 300;
  private static readonly _HEIGHT = 300;

  @Input() imageMeta: IImageMeta;
  @Input() region: IImageRegion;
  @Input() dimensions: IDimensions;

  private get _croppedArea(): ICroppedArea {
    const retVal: ICroppedArea = {
      x: getCropX(this.region, this.dimensions),
      y: getCropY(this.region, this.dimensions),
      width: getCropWidth(this.region, this.dimensions),
      height: getCropHeight(this.region, this.dimensions)
    };
    return retVal;
  }

  constructor() { }

  ngOnInit() {
  }
}

function getCropX(region: IImageRegion, dimensions: IDimensions): number {
  return 0;
}

function getCropY(region: IImageRegion, dimensions: IDimensions): number {
  return 0;
}

function getCropWidth(region: IImageRegion, dimensions: IDimensions): number {
  return 0;
}

function getCropHeight(region: IImageRegion, dimensions: IDimensions): number {
  return 0;
}
