import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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

  private _scope: ReplaySubject<IQuery<Array<IImageRegion>>> =
    new ReplaySubject<IQuery<Array<IImageRegion>>>();

  private _regions: BehaviorSubject<Array<IImageRegion>> =
      new BehaviorSubject<Array<IImageRegion>>(undefined);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService) {
    this._subscription = this._scope.subscribe(scope => this._newScope(scope));
  }

  setAllRegionsScope(imageMeta: IImageMeta) {
    this._scope.next(() => allRegions(this._http, imageMeta));
  }

  get regions(): Observable<Array<IImageRegion>> {
    return this._regions.filter(arr => arr !== undefined);
  }

  updateRegionsInScope(imageMeta: IImageMeta, regions: Array<IImageRegion>) {
    this._scope.subscribe((scope: IQuery<Array<IImageRegion>>) => {
      let obs = updateRegions(this._http, this._httpSettings.DefReqOpts,
        imageMeta, scope, regions);
      obs.subscribe((updatedRegions: Array<IImageRegion>) => {
        this._regions.next(updatedRegions);
      })
    });
  }

  private _newScope(scope: IQuery<Array<IImageRegion>>) {
    scope().subscribe(regions => this._regions.next(regions));
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
