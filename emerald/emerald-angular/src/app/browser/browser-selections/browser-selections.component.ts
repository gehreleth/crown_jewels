import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'
import { BrowserView } from '../browser-view'

@Component({
  selector: 'app-browser-selections',
  styles : [],
  template: `
<app-browser-common
  [node]="_storageService.SelectedNode"
  [imageMeta]="_imageMeta"
  [view]="_SELECTIONS">
</app-browser-common>
`
})
export class BrowserSelectionsComponent implements OnInit {
  private readonly _SELECTIONS = BrowserView.Selections;
  private _imageMeta: IImageMeta;

  constructor(private _storageService: EmeraldBackendStorageService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._storageService.SelectedNodeChanged.subscribe((node: ITreeNode) => {
      if (node.type === NodeType.Image) {
        this._imageMetadataService.getMeta(node).subscribe((imageMeta: IImageMeta) => {
          this._imageMeta = imageMeta;
        });
      } else {
        this._imageMeta = null;
      }
    });
  }
}
