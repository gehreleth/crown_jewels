import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpSettingsService } from '../services/http-settings.service';

import { ITreeNode } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import { IQuery } from '../backend/query';

import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';

import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';

@Injectable()
export class ImageMetadataService {
  private readonly _scope$ = new ReplaySubject<IQuery<Array<IImageRegion>>>(1);

  private readonly _regionsCache$ = new BehaviorSubject<Array<IImageRegion>>(undefined);

  private readonly _activeRegion$ = new BehaviorSubject<IImageRegion>(null);

  private readonly _imageMeta$ = new BehaviorSubject<IImageMeta>(undefined);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  { }

  setImageMeta(imageMeta: IImageMeta): void {
    this._imageMeta$.next(imageMeta);
  }

  get imageMeta(): Observable<IImageMeta> {
    return this._imageMeta$.filter(Boolean);
  }

  fromNode(node: ITreeNode): Observable<IImageMeta> {
    return metaFromNode(this._http, this._httpSettings.DefReqOpts, node);
  }

  rotateCW(imageMeta: IImageMeta): Observable<IImageMeta> {
    return rotateCW(this._http, this._httpSettings.DefReqOpts, imageMeta);
  }

  rotateCCW(imageMeta: IImageMeta): Observable<IImageMeta> {
    return rotateCCW(this._http, this._httpSettings.DefReqOpts, imageMeta);
  }

  get scope(): Observable<IQuery<Array<IImageRegion>>> {
    return this._scope$;
  }

  setAllRegionsScope(imageMeta: IImageMeta) {
    this._eraseContext();
    this._scope$.next(() => allRegions(this._http, imageMeta));
  }

  updateRegionsCache(regions: Array<IImageRegion>) {
    return this._regionsCache$.next(regions);
  }

  get regionsCache(): Observable<Array<IImageRegion>> {
    return this._regionsCache$.filter(cache => cache !== undefined);
  }

  setActiveRegion(region: IImageRegion) {
    this._activeRegion$.next(region);
  }

  get activeRegion(): Observable<IImageRegion> {
    return this._activeRegion$;
  }

  saveRegions(imageMeta: IImageMeta, scope: IQuery<Array<IImageRegion>>,
              regions: Array<IImageRegion>): Observable<Array<IImageRegion>>
  {
    return updateRegions(this._http, this._httpSettings.DefReqOpts, imageMeta, scope, regions);
  }

  private _eraseContext() {
    this._activeRegion$.next(null);
    this._regionsCache$.next(undefined);
  }
}
