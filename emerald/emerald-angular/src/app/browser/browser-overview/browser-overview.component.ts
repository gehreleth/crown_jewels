import { Component } from '@angular/core';
import { BrowserView } from '../browser-view'
import { RegionEditorService } from '../../services/region-editor.service'
import getBlobUrl from '../../util/getBlobUrl';

@Component({
  template: `
  <app-browser-common
    [view]="_OVERVIEW"
    [dimensions]="_regionEditorService.dimensions">
  </app-browser-common>`
})
export class BrowserOverviewComponent {
  private readonly _OVERVIEW = BrowserView.Overview;

  constructor(private _regionEditorService: RegionEditorService) {}

  private get _imageHref(): string {
    const im = this._regionEditorService.imageMeta;
    return im ? getBlobUrl(im) : null;
  }
}
