import { Component } from '@angular/core';
import { BrowserView } from '../browser-view'

@Component({
  template: `<app-browser-common [view]="_OVERVIEW"></app-browser-common>`
})
export class BrowserOverviewComponent {
  private readonly _OVERVIEW = BrowserView.Overview;

  constructor() {}
}
