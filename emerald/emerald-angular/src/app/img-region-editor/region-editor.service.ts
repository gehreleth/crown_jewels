import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BrowserService } from '../browser/browser.service';
import { HttpSettingsService } from '../http-settings.service';

import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

import { IDimensions } from './dimensions'
import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../backend/entities/page-range';

import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';
import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

@Injectable()
export class RegionEditorService implements IBusyIndicatorHolder {
  busyIndicator: Promise<any> = Promise.resolve(1);

  selectionsSemicolonPageRange: EventEmitter<any> = new EventEmitter<any>();

  imageMeta: IImageMeta = null;
  imageMetaChanged: EventEmitter<IImageMeta> = new EventEmitter<IImageMeta>();

  pageRange: IPageRange = RegionEditorService._defPageRange;
  pageRangeChanged: EventEmitter<IPageRange> = new EventEmitter<IPageRange>();

  dimensions: IDimensions = { };
  dimensionsChanged: EventEmitter<IDimensions> = new EventEmitter<IDimensions>();

  overviewRegions: Array<IImageRegion> = [];
  overviewRegionsChanged: EventEmitter<Array<IImageRegion>> = new EventEmitter<Array<IImageRegion>>();

  get regionsBySel(): Array<IImageRegion> {
    const lbound = this.pageRange.page * this.pageRange.count;
    let ubound = lbound + this.pageRange.count;
    ubound = Math.min(ubound, this.overviewRegions.length);
    return this.overviewRegions.slice(lbound, ubound);
  }

  private static readonly _defPageRange: IPageRange = { page: 0, count: 10 };
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _http: Http,
              private _browserService: BrowserService,
              private _httpSettings: HttpSettingsService)
  {
    this._browserService.treePaneSelectionChanged.subscribe((node: ITreeNode) =>
      this.handleSelectedNodeChanged(node));

    this.selectionsSemicolonPageRange.subscribe((pageRangeDict: any) =>
      this.handlePageRange(pageRangeDict));

    this.imageMetaChanged.subscribe((imageMeta: IImageMeta) =>
      this.handleImageMetaChange(imageMeta));
  }

  private handleImageMetaChange(imageMeta: IImageMeta) {
    this.pageRange = RegionEditorService._defPageRange;
    this.pageRangeChanged.emit(this.pageRange);

    this.overviewRegions = [];
    this.overviewRegionsChanged.emit(this.overviewRegions);
    if (imageMeta) {
      setBusyIndicator(this, allRegions(this._http, imageMeta))
        .subscribe((regions: Array<IImageRegion>) => {
          this.overviewRegions = regions;
          this.overviewRegionsChanged.emit(this.overviewRegions);
        });
    }
  }

  private handlePageRange(pageRangeDict: any) {
    let newPageRange: IPageRange = this.pageRange;
    if (pageRangeDict.page && this._isNumberRe.test(pageRangeDict.page)) {
      newPageRange.page = parseInt(pageRangeDict.page);
    }

    if (pageRangeDict.count && this._isNumberRe.test(pageRangeDict.count)) {
      newPageRange.count = parseInt(pageRangeDict.count);
    }

    newPageRange.numPages = Math.ceil(this.overviewRegions.length / this.pageRange.count);

    this.pageRange = newPageRange;
    this.pageRangeChanged.emit(this.pageRange);
  }

  private handleSelectedNodeChanged(node: ITreeNode) {
    if (node.type === NodeType.Image) {
      setBusyIndicator(this, metaFromNode(this._http,
        this._httpSettings.DefReqOpts, node))
          .subscribe((imageMeta: IImageMeta) => {
            this.imageMeta = imageMeta;
            this.imageMetaChanged.emit(this.imageMeta);
          });
    } else {
      this.imageMeta = null;
      this.imageMetaChanged.emit(this.imageMeta);
    }
  }

  get imageHref(): string {
    return '/emerald/blobs/' + `${this.imageMeta.aquamarineId}`
      + `?rot=${Rotation[this.imageMeta.rotation]}`
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

  saveRegions(regions: Array<IImageRegion>): void {
    const scope = () => allRegions(this._http, this.imageMeta);
    setBusyIndicator(this, updateRegions(this._http, this._httpSettings.DefReqOpts,
      this.imageMeta, scope, regions))
        .subscribe(regions => {
          this.overviewRegions = regions;
          this.overviewRegionsChanged.emit(this.overviewRegions);
        });
  }

  updateDimensions(naturalWidth?: number, naturalHeight?: number,
    clientWidth?: number, clientHeight?: number)
  {
    this.dimensions = {
       naturalWidth: naturalWidth,
       naturalHeight: naturalHeight,
       clientWidth: clientWidth,
       clientHeight: clientHeight
    };
    this.dimensionsChanged.emit(this.dimensions);
  }
}
