import { EventEmitter} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { IDimensions } from '../util/dimensions'
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../util/page-range';

import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';
import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';

export interface IImageMetaEditor extends IBusyIndicatorHolder {
  busyIndicator: Promise<any>;
  imageMeta: IImageMeta;
  imageMetaChanged: EventEmitter<IImageMeta>;
  pageRange: IPageRange;
  pageRangeChanged: EventEmitter<IPageRange>;
  dimensions: Observable<IDimensions>;
  regionsInScope: Observable<Array<IImageRegion>>;
  rotateCW(): void;
  rotateCCW(): void;
  saveRegions(regions: Array<IImageRegion>): void;
  paginatorLink(pageRange: IPageRange): void;
  initDimensions(dimensions: IDimensions): void;
};
