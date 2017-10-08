import { Component } from '@angular/core';
import { BrowserView } from '../browser-view'
import getBlobUrl from '../../util/getBlobUrl';

@Component({
  template: `<app-browser-common [view]="_OVERVIEW"></app-browser-common>`
})
export class BrowserOverviewComponent {
  private readonly _OVERVIEW = BrowserView.Overview;

  constructor() {}
}
