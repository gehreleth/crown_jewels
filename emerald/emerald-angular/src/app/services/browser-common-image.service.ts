import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { HttpSettingsService } from '../services/http-settings.service';

import { IDimensions } from '../util/dimensions'
import { ITreeNode } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

@Injectable()
export class BrowserCommonImageService {
  private _imageMeta: BehaviorSubject<IImageMeta> =
    new BehaviorSubject<IImageMeta>(undefined);

  private _dimensions: BehaviorSubject<IDimensions> =
    new BehaviorSubject<IDimensions>(undefined);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  { }

  setNode(node: ITreeNode, busy?: IBusyIndicatorHolder): void {
    console.log("setNode", node);
    let obs = metaFromNode(this._http, this._httpSettings.DefReqOpts, node, true);
    obs = busy ? setBusyIndicator(busy, obs) : obs;
    obs.subscribe((imageMeta: IImageMeta) => {
      this._imageMeta.next(imageMeta);
    });
  }

  setDimensions(dimensions: IDimensions): void {
    this._dimensions.next(dimensions);
  }

  clearDimensions(): void {
    this._dimensions.next(undefined);
  }

  get imageMeta(): Observable<IImageMeta> {
    return this._imageMeta.filter(im => im !== undefined);
  }

  get dimensions(): Observable<IDimensions> {
    return this._dimensions.filter(dim => dim !== undefined);
  }

  rotateCW(imageMeta: IImageMeta, busy?: IBusyIndicatorHolder): void {
    let obs = rotateCW(this._http, this._httpSettings.DefReqOpts, imageMeta);
    obs = busy ? setBusyIndicator(busy, obs) : obs;
    obs.subscribe(im => this._imageMeta.next(im));
  }

  rotateCCW(imageMeta: IImageMeta, busy?: IBusyIndicatorHolder): void {
    let obs = rotateCCW(this._http, this._httpSettings.DefReqOpts, imageMeta);
    obs = busy ? setBusyIndicator(busy, obs) : obs;
    obs.subscribe(im => this._imageMeta.next(im));
  }
}
