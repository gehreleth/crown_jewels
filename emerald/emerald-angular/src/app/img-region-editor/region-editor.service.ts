import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BrowserService } from '../browser/browser.service';
import { HttpSettingsService } from '../http-settings.service';
import { IPageRange } from '../backend/entities/page-range';

import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

import { IDimensions } from './dimensions'
import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';
import assignRegionsAndUpdate from '../backend/assignRegionsAndUpdate';

@Injectable()
export class RegionEditorService {
  busyIndicator: Promise<any> = Promise.resolve(1);

  selectionsSemicolonPageRange: EventEmitter<any> = new EventEmitter<any>();

  imageMeta: IImageMeta = null;
  imageMetaChanged: EventEmitter<IImageMeta> = new EventEmitter<IImageMeta>();

  pageRange: IPageRange = RegionEditorService._defPageRange;
  pageRangeChanged: EventEmitter<IPageRange> = new EventEmitter<IPageRange>();

  dimensions: IDimensions = { };
  dimensionsChanged: EventEmitter<IDimensions> = new EventEmitter<IDimensions>();

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

    this.imageMetaChanged.subscribe(() => {
      this.pageRange = RegionEditorService._defPageRange;
      this.pageRangeChanged.emit(this.pageRange);
    });
  }

  private handlePageRange(pageRangeDict: any) {
    let newPageRange: IPageRange = this.pageRange;
    if (pageRangeDict.page && this._isNumberRe.test(pageRangeDict.page)) {
      newPageRange.page = parseInt(pageRangeDict.page);
    }

    if (pageRangeDict.count && this._isNumberRe.test(pageRangeDict.count)) {
      newPageRange.count = parseInt(pageRangeDict.count);
    }

    this.pageRange = newPageRange;
    this.pageRangeChanged.emit(this.pageRange);
  }

  private handleSelectedNodeChanged(node: ITreeNode) {
    if (node.type === NodeType.Image) {
      this.setBusyIndicator(metaFromNode(this._http,
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

  rotateCW(): void {
    this.setBusyIndicator(rotateCW(this._http,
                                   this._httpSettings.DefReqOpts,
                                   this.imageMeta))
      .subscribe(im => {
        this.imageMeta = im;
        this.imageMetaChanged.emit(this.imageMeta);
      });
  }

  rotateCCW(): void {
    this.setBusyIndicator(rotateCCW(this._http,
                                    this._httpSettings.DefReqOpts,
                                    this.imageMeta))
      .subscribe(im => {
        this.imageMeta = im;
        this.imageMetaChanged.emit(this.imageMeta);
      });
  }

  saveRegions(regions: Array<IImageRegion>): void {
    this.setBusyIndicator(assignRegionsAndUpdate(this._http,
                                                 this._httpSettings.DefReqOpts,
                                                 this.imageMeta,
                                                 regions))
      .subscribe(im => {
        this.imageMeta = im;
        this.imageMetaChanged.emit(this.imageMeta);
      });
  }

  private setBusyIndicator<Q>(arg: Observable<Q>, logObj?: any): Observable<Q> {
    let pr = new Promise<Q>((resolve, reject) => {
      arg.subscribe((q: Q) => {
        if (logObj) { console.log("SUCCESS", logObj); }
        resolve(q);
      },
      (err: Error) => {
        if (logObj) { console.log("FAIL", logObj); }
        reject(err);
      });
    });
    this.busyIndicator = this.busyIndicator.then(() => pr);
    return Observable.fromPromise(pr);
  }
}
