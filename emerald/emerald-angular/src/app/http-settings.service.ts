import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class HttpSettingsService {

  get DefReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }

  constructor() { }

}
