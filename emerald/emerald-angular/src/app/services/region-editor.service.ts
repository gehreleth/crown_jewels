import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { HttpSettingsService } from '../services/http-settings.service';

import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IQuery } from '../backend/query';

import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

import { Subscription } from 'rxjs/Subscription';


@Injectable()
export class RegionEditorService {
  private _subscription: Subscription;

  private readonly _scope$ = new ReplaySubject<IQuery<Array<IImageRegion>>>(1);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService) {
  }

  get scope(): Observable<IQuery<Array<IImageRegion>>> {
    return this._scope$;
  }

  setAllRegionsScope(imageMeta: IImageMeta) {
    this._scope$.next(() => allRegions(this._http, imageMeta));
  }

  saveRegions(imageMeta: IImageMeta, scope: IQuery<Array<IImageRegion>>,
              regions: Array<IImageRegion>): Observable<Array<IImageRegion>>
  {
    return updateRegions(this._http, this._httpSettings.DefReqOpts, imageMeta, scope, regions);
  }
}
