import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'

@Component({
  selector: 'app-browser-overview',
  styles : [],
  template: `
<app-browser-common
  [node]="_storageService.SelectedNode"
  [imageMeta]="_imageMeta">
</app-browser-common>
`
})
export class BrowserOverviewComponent implements OnInit {
  private _isNumberRe: RegExp = new RegExp("^\\d+$");
  private _imageMeta: IImageMeta;

  constructor(private _activatedRoute: ActivatedRoute,
              private _storageService: EmeraldBackendStorageService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._activatedRoute.parent.params.subscribe((params: Params) => {
      const idParam: string = params['id'];
      if (this._isNumberRe.test(idParam)) {
        this._storageService.selectById(parseInt(idParam));
      }
    });
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
