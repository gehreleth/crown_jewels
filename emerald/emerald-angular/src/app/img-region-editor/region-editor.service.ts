import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BrowserService } from '../browser/browser.service';
import { IPageRange } from '../backend/entities/page-range';

import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';

import metaFromNode from '../backend/metaFromNode';

@Injectable()
export class RegionEditorService {
  busyIndicator: Promise<any> = Promise.resolve(1);

  selectionsSemicolonPageRange: EventEmitter<any> = new EventEmitter<any>();

  rightPaneSelection: IImageMeta = null;
  rightPaneSelectionChanged: EventEmitter<IImageMeta> = new EventEmitter<IImageMeta>();

  pageRange: IPageRange = RegionEditorService._defPageRange;
  pageRangeChanged: EventEmitter<IPageRange> = new EventEmitter<IPageRange>();

  private static readonly _defPageRange: IPageRange = { page: 0, count: 10 };
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _http: Http,
              private _browserService: BrowserService)
  {
    this._browserService.treePaneSelectionChanged.subscribe((node: ITreeNode) =>
      this.handleSelectedNodeChanged(node));

    this.selectionsSemicolonPageRange.subscribe((pageRangeDict: any) =>
      this.handlePageRange(pageRangeDict));

    this.rightPaneSelectionChanged.subscribe(() => {
      this.pageRange = RegionEditorService._defPageRange;
      this.pageRangeChanged.emit(this.pageRange);
    });
  }

  private get _defReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
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
      this.setBusyIndicator(metaFromNode(this._http, this._defReqOpts, node))
        .subscribe((imageMeta: IImageMeta) => {
          this.rightPaneSelection = imageMeta;
          this.rightPaneSelectionChanged.emit(this.rightPaneSelection);
        });
    } else {
      this.rightPaneSelection = null;
      this.rightPaneSelectionChanged.emit(this.rightPaneSelection);
    }
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
