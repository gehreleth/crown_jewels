import { Injectable } from '@angular/core';
import { IPageRange } from '../util/page-range';

@Injectable()
export class BrowserPagesService {
  private static readonly DEF_PAGE_RANGE : IPageRange = {
    page: 0,
    count: 10
  };
  private _pageRange: IPageRange;

  constructor() { }

  setPageRange(pageRange: IPageRange) {
    this._pageRange = pageRange;
  }

  clearPageRange() {
    this._pageRange = undefined;
  }

  get pageRange(): IPageRange {
    return this._pageRange
      ? this._pageRange
      : BrowserPagesService.DEF_PAGE_RANGE;
  }
}
