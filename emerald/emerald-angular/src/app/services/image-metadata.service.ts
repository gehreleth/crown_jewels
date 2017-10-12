import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpSettingsService } from '../services/http-settings.service';

import { ITreeNode } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';

import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';

@Injectable()
export class ImageMetadataService {
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
}
