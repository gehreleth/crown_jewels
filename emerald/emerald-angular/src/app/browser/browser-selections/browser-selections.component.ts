import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BrowserService } from '../../services/browser.service';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private _subscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService)
  { }

  ngOnInit() {
    this._subscription = this._activatedRoute.params.subscribe((params: Params) => {
      this._browserService.semicolonSlashPageRange.emit({
        page: params['page'], count: params['count']
      });
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
