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

interface ScopeSubj {
  scope: IQuery<Array<IImageRegion>>,
  busy?: IBusyIndicatorHolder
};

@Injectable()
export class RegionEditorService {
  private _subscription: Subscription;

  private readonly _scope$ = new ReplaySubject<ScopeSubj>(1);
  private readonly _regions$ = new ReplaySubject<Array<IImageRegion>>(1);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService) {
    this._subscription = this._scope$.subscribe(q => {
      this._changeScope(q.scope, q.busy)
    });
  }

  get scope(): Observable<IQuery<Array<IImageRegion>>> {
    return this._scope$.map(q => q.scope);
  }

  setAllRegionsScope(imageMeta: IImageMeta, busy?: IBusyIndicatorHolder) {
    this._scope$.next({
      scope: () => allRegions(this._http, imageMeta),
      busy: busy
    });
  }

  get regions(): Observable<Array<IImageRegion>> {
    return this._regions$;
  }

  saveRegions(imageMeta: IImageMeta, regions: Array<IImageRegion>,
    busy?: IBusyIndicatorHolder)
  {
    this.scope.first().subscribe((scope: IQuery<Array<IImageRegion>>) => {
      let obs = updateRegions(this._http, this._httpSettings.DefReqOpts,
        imageMeta, scope, regions);
      obs = busy ? setBusyIndicator(busy, obs) : obs;
      obs.subscribe((updatedRegions: Array<IImageRegion>) => {
        this._regions$.next(updatedRegions);
      })
    });
  }

  private _changeScope(scope: IQuery<Array<IImageRegion>>, busy?: IBusyIndicatorHolder) {
    let obs = scope();
    obs = busy ? setBusyIndicator(busy, obs) : obs;
    obs.subscribe(regions => this._regions$.next(regions));
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
