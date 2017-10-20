import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITag } from '../backend/entities/tag';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { HttpSettingsService } from './http-settings.service';

import getTagByName from '../backend/getTagByName';
import populateTagsByPattern from '../backend/populateTagsByPattern';

@Injectable()
export class RegionTagsService {
  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  { }

  getTagByName(name: string, description?: string): Observable<ITag> {
    return getTagByName(this._http, this._httpSettings.DefReqOpts, name);
  }

  populateTagsByPattern(pattern: string): Observable<Array<ITag>> {
    return populateTagsByPattern(this._http, pattern);
  }
}
