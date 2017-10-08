import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { EventEmitter} from '@angular/core';
import { IImageMetaEditor } from './image-meta-editor';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { HttpSettingsService } from './http-settings.service';

import "rxjs/add/observable/of";

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { IDimensions } from '../util/dimensions'
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../backend/entities/page-range';

import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';
import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';

import setBusyIndicator from '../util/setBusyIndicator';
import getBlobUrl from '../util/getBlobUrl';

export class ImageMetaEditorImpl implements IImageMetaEditor {
  busyIndicator: Promise<any> = Promise.resolve(1);
  imageMeta: IImageMeta;
  imageMetaChanged = new EventEmitter<IImageMeta>();
  pageRange: IPageRange;
  pageRangeChanged = new EventEmitter<IPageRange>();

  private _regionsInScope: BehaviorSubject<Array<IImageRegion>>;
  private _isNumberRe: RegExp = new RegExp("^\\d+$");
  private static readonly _defPageRange: IPageRange = { page: 0, count: 10 };
  private _prevImageHref: string;
  private _dimensions: BehaviorSubject<IDimensions>;

  constructor(private _http: Http, private _httpSettings: HttpSettingsService,
    imageMeta: IImageMeta)
  {
    this.imageMeta = imageMeta;
    this.pageRange = ImageMetaEditorImpl._defPageRange;
    this._dimensions = new BehaviorSubject<IDimensions>(null);
    this._regionsInScope = new BehaviorSubject<Array<IImageRegion>>(null);
    this.invalidateRegionsInScope();
    this.imageMetaChanged.subscribe((imageMeta: IImageMeta) =>
      this.invalidateDimensions(imageMeta));
  }

  get dimensions(): Observable<IDimensions> {
    const pred = (d: IDimensions) => d ? true : false;
    return this._dimensions.filter(pred);
  }

  get regionsInScope(): Observable<Array<IImageRegion>> {
    const pred = (arr: Array<IImageRegion>) =>
      (arr === undefined || arr == null) ? false : true;
    return this._regionsInScope.filter(pred);
  }

  private invalidateDimensions(imageMeta: IImageMeta) {
    const currImageHref = getBlobUrl(imageMeta);
    if (currImageHref !== this._prevImageHref) {
      this._dimensions.next(null);
      this._prevImageHref = currImageHref;
    }
  }

  private invalidateRegionsInScope() {
    setBusyIndicator(this, allRegions(this._http, this.imageMeta))
      .subscribe((regions: Array<IImageRegion>) => {
        this._regionsInScope.next(regions);
      });
  }

  rotateCW(): void {
    setBusyIndicator(this, rotateCW(this._http,
                                    this._httpSettings.DefReqOpts,
                                    this.imageMeta))
      .subscribe(im => {
        this.imageMeta = im;
        this.imageMetaChanged.emit(this.imageMeta);
      });
  }

  rotateCCW(): void {
    setBusyIndicator(this, rotateCCW(this._http,
                                     this._httpSettings.DefReqOpts,
                                     this.imageMeta))
      .subscribe(im => {
        this.imageMeta = im;
        this.imageMetaChanged.emit(this.imageMeta);
      });
  }

  saveRegions(regions: Array<IImageRegion>) {
    setBusyIndicator(this, updateRegions(this._http, this._httpSettings.DefReqOpts,
      this.imageMeta, () => this.regionsInScope, regions))
        .subscribe(regions => {
          this._regionsInScope.next(regions);
        });
  }

  handlePageRange(pageRangeDict: any) {
    setBusyIndicator(this, this.regionsInScope).subscribe((regions: Array<IImageRegion>) => {
      let newPageRange: IPageRange = this.pageRange;
      if (pageRangeDict.page && this._isNumberRe.test(pageRangeDict.page)) {
        newPageRange.page = parseInt(pageRangeDict.page);
      }
      if (pageRangeDict.count && this._isNumberRe.test(pageRangeDict.count)) {
        newPageRange.count = parseInt(pageRangeDict.count);
      }
      newPageRange.numPages = Math.ceil(regions.length / this.pageRange.count);
      this.pageRange = newPageRange;
    });
  }

  updateDimensions(dimensions: IDimensions)
  {
    setBusyIndicator(this, Observable.of(1)).subscribe(() => {
      this._dimensions.next(dimensions);
    });
  }
}
