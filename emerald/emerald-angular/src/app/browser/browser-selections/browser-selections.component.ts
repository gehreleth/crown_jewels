import { Component } from '@angular/core';
import { BrowserView } from '../browser-view'

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`
})
export class BrowserSelectionsComponent {
  private readonly _SELECTIONS = BrowserView.Selections;

  constructor() { }
}
