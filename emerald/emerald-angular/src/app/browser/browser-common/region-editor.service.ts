import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BrowserService } from '../browser.service';
import { HttpSettingsService } from '../../http-settings.service';

import "rxjs/add/observable/of";
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

import { IDimensions } from '../../util/dimensions'
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta, Rotation } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IPageRange } from '../../backend/entities/page-range';

import metaFromNode from '../../backend/metaFromNode';
import rotateCW from '../../backend/rotateCW';
import rotateCCW from '../../backend/rotateCCW';
import allRegions from '../../backend/allRegions';
import updateRegions from '../../backend/updateRegions';
import getBlobUrl from '../../util/getBlobUrl';

import { IBusyIndicatorHolder } from '../../util/busy-indicator-holder';
import setBusyIndicator from '../../util/setBusyIndicator';

interface IRegionEditorServiceState {
  readonly node: ITreeNode;

  imageMeta: IImageMeta;
  imageMetaChanged: EventEmitter<IImageMeta>;

  pageRange: IPageRange;
  pageRangeChanged: EventEmitter<IPageRange>;

  dimensions: IDimensions;
  dimensionsChanged: EventEmitter<IDimensions>;

  overviewRegions: Array<IImageRegion>;
  overviewRegionsChanged: EventEmitter<Array<IImageRegion>>;
};

@Injectable()
export class RegionEditorService implements IBusyIndicatorHolder {
  busyIndicator: Promise<any> = Promise.resolve(1);

  selectionsSemicolonPageRange: EventEmitter<any> = new EventEmitter<any>();

  private _context: IRegionEditorServiceState = null;

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
  }

  private handleSelectedNodeChanged(node: ITreeNode) {
    const that = this._context;
    if (!that || (node.id !== that.node.id)) {
      setBusyIndicator(this, Observable.of(1)).subscribe(() => {
        if (node.type === NodeType.Image) {
          setBusyIndicator(this, metaFromNode(this._http,
            this._httpSettings.DefReqOpts, node))
              .subscribe((imageMeta: IImageMeta) => {
                this._context = this.makeNewState(node, imageMeta);
                this.loadRegions(this._context);
              });
        } else {
          this._context = null;
        }
      });
    }
  }

  private makeNewState(node: ITreeNode, imageMeta: IImageMeta): IRegionEditorServiceState {
    const retVal : IRegionEditorServiceState = {
      node: node,
      imageMeta: imageMeta,
      imageMetaChanged: new EventEmitter<IImageMeta>(),
      pageRange: RegionEditorService._defPageRange,
      pageRangeChanged: new EventEmitter<IPageRange>(),
      dimensions: { },
      dimensionsChanged: new EventEmitter<IDimensions>(),
      overviewRegions: [],
      overviewRegionsChanged: new EventEmitter<Array<IImageRegion>>()
    }
    return retVal;
  }

  get imageMeta(): IImageMeta {
    const that = this._context;
    return that ? that.imageMeta : null;
  }

  get imageMetaChanged(): EventEmitter<IImageMeta> {
    const that = this._context;
    return that ? that.imageMetaChanged : null;
  }

  get pageRange(): IPageRange {
    const that = this._context;
    return that ? that.pageRange : RegionEditorService._defPageRange;
  }

  get pageRangeChanged(): EventEmitter<IPageRange> {
    const that = this._context;
    return that ? that.pageRangeChanged : null;
  }

  get dimensions(): IDimensions {
    const that = this._context;
    return that ? that.dimensions : null;
  }

  get dimensionsChanged(): EventEmitter<IDimensions> {
    const that = this._context;
    return that ? that.dimensionsChanged: null;
  }

  get overviewRegions(): Array<IImageRegion> {
    const that = this._context;
    return that ? that.overviewRegions : null;
  }

  get overviewRegionsChanged(): EventEmitter<Array<IImageRegion>> {
    const that = this._context;
    return that ? that.overviewRegionsChanged : null;
  }

  get regionsBySel(): Array<IImageRegion> {
    const that = this._context;
    if (that) {
      const lbound = that.pageRange.page * that.pageRange.count;
      let ubound = lbound + that.pageRange.count;
      ubound = Math.min(ubound, that.overviewRegions.length);
      return that.overviewRegions.slice(lbound, ubound);
    } else {
      return null;
    }
  }

  private loadRegions(context: IRegionEditorServiceState) {
    setBusyIndicator(this, Observable.of(1)).subscribe(() => {
      context.pageRange = RegionEditorService._defPageRange;
      context.pageRangeChanged.emit(context.pageRange);

      context.overviewRegions = [];
      context.overviewRegionsChanged.emit(context.overviewRegions);
      setBusyIndicator(this, allRegions(this._http, context.imageMeta))
        .subscribe((regions: Array<IImageRegion>) => {
          context.overviewRegions = regions;
          context.overviewRegionsChanged.emit(context.overviewRegions);
        });
    });
  }

  private handlePageRange(pageRangeDict: any) {
    const that = this._context;
    setBusyIndicator(this, Observable.of(1)).subscribe(() => {
      let newPageRange: IPageRange = that.pageRange;
      if (pageRangeDict.page && this._isNumberRe.test(pageRangeDict.page)) {
        newPageRange.page = parseInt(pageRangeDict.page);
      }

      if (pageRangeDict.count && this._isNumberRe.test(pageRangeDict.count)) {
        newPageRange.count = parseInt(pageRangeDict.count);
      }

      newPageRange.numPages = Math.ceil(that.overviewRegions.length / that.pageRange.count);

      that.pageRange = newPageRange;
      that.pageRangeChanged.emit(that.pageRange);
    });
  }

  get imageHref(): string {
    const that = this._context;
    return that ? getBlobUrl(that.imageMeta) : null;
  }

  rotateCW(): void {
    const that = this._context;
    setBusyIndicator(this, rotateCW(this._http,
                                    this._httpSettings.DefReqOpts,
                                    that.imageMeta))
      .subscribe(im => {
        that.imageMeta = im;
        that.imageMetaChanged.emit(that.imageMeta);
      });
  }

  rotateCCW(): void {
    const that = this._context;
    setBusyIndicator(this, rotateCCW(this._http,
                                     this._httpSettings.DefReqOpts,
                                     that.imageMeta))
      .subscribe(im => {
        that.imageMeta = im;
        that.imageMetaChanged.emit(that.imageMeta);
      });
  }

  saveRegions(regions: Array<IImageRegion>): void {
    const that = this._context;
    const scope = () => allRegions(this._http, that.imageMeta);
    setBusyIndicator(this, updateRegions(this._http, this._httpSettings.DefReqOpts,
      that.imageMeta, scope, regions))
        .subscribe(regions => {
          that.overviewRegions = regions;
          that.overviewRegionsChanged.emit(that.overviewRegions);
        });
  }

  updateDimensions(naturalWidth?: number, naturalHeight?: number,
    clientWidth?: number, clientHeight?: number)
  {
    const that = this._context;
    setBusyIndicator(this, Observable.of(1)).subscribe(() => {
      that.dimensions = {
         naturalWidth: naturalWidth,
         naturalHeight: naturalHeight,
         clientWidth: clientWidth,
         clientHeight: clientHeight
      };
      that.dimensionsChanged.emit(that.dimensions);
    });
  }
}
