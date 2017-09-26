import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { BrowserView } from '../browser-view'

@Component({
  selector: 'app-browser-selections',
  styles : [],
  template: `
<app-browser-common
  [node]="_storageService.SelectedNode"
  [imageMeta]="_storageService.SelectedImageMeta"
  [view]="_SELECTIONS">
</app-browser-common>
`
})
export class BrowserSelectionsComponent implements OnInit {
  private readonly _SELECTIONS = BrowserView.Selections;

  constructor(private _storageService: EmeraldBackendStorageService)
  { }

  ngOnInit() {
  }
}
