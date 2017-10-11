import { Injectable } from '@angular/core';
import { IPageRange } from '../util/page-range';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class BrowserPagesService {
  private readonly pageRange$ = new ReplaySubject<IPageRange>(1);

  constructor() { }

  get DefPageRange() : IPageRange { // TODO: Service parameter
    return {
      page: 0,
      count: 10
    };
  }

  setPageRange(pageRange: IPageRange) {
    this.pageRange$.next(pageRange);
  }

  get pageRange(): Observable<IPageRange> {
    return this.pageRange$;
  }
}
