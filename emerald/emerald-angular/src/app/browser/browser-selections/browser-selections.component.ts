import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BrowserService } from '../../services/browser.service';
import { BrowserPagesService } from '../../services/browser-pages.service';

import { IPageRange } from '../../util/page-range';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`,
  providers: [ BrowserPagesService ]
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private readonly _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _subscription: Subscription;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _browserPages: BrowserPagesService)
  { }

  ngOnInit() {
    this._subscription = this._activatedRoute.params.subscribe((params: Params) => {
      let pageRangeDefined = true;
      let pageRange: IPageRange = this._browserPages.DefPageRange;

      let pageStr: string = params['page'];
      if (pageStr && this._isNumberRe.test(pageStr)) {
        pageRange.page = parseInt(pageStr);
      } else {
        pageRangeDefined = false;
      }

      let countStr: string = params['count'];
      if (countStr && this._isNumberRe.test(countStr)) {
        pageRange.count = parseInt(countStr);
      } else {
        pageRangeDefined = false;
      }
      if (pageRangeDefined) {
        this._browserPages.setPageRange(pageRange);
      } else {
        this._router.navigate(['./', {
          page: pageRange.page,
          count: pageRange.count
        }], { relativeTo: this._activatedRoute });
      }
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
