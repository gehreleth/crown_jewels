import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { RegionEditorService } from '../../img-region-editor/region-editor.service'
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private _subscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _regionEditor: RegionEditorService)
  { }

  ngOnInit() {
    this._subscription = this._activatedRoute.params.subscribe((params: Params) => {
      this._regionEditor.selectionsSemicolonPageRange.emit({
        page: params['page'], count: params['count']
      });
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
