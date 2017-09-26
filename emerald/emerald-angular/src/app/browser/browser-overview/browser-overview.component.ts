import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { BrowserView } from '../browser-view'

@Component({
  selector: 'app-browser-overview',
  styles : [],
  template: `
<app-browser-common
  [node]="_storageService.SelectedNode"
  [imageMeta]="_storageService.SelectedImageMeta"
  [view]="_OVERVIEW">
</app-browser-common>
`
})
export class BrowserOverviewComponent implements OnInit {
  private readonly _OVERVIEW = BrowserView.Overview;

  constructor(private _storageService: EmeraldBackendStorageService)
  { }

  ngOnInit() {
  }
}
