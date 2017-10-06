import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { RegionEditorService } from '../../services/region-editor.service'
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  template: `<app-browser-common
    [view]="_SELECTIONS"
    [dimensions]="_regionEditorService.dimensions">
  </app-browser-common>`
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private _subscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _regionEditorService: RegionEditorService)
  { }

  private get _imageHref(): string {
    const im = this._regionEditorService.imageMeta;
    return im ? getBlobUrl(im) : null;
  }

  ngOnInit() {
    this._subscription = this._activatedRoute.params.subscribe((params: Params) => {
      this._regionEditorService.selectionsSemicolonPageRange.emit({
        page: params['page'], count: params['count']
      });
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
