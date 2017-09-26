import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'

@Component({
  selector: 'app-browser-overview',
  templateUrl: './browser-overview.component.html',
  styleUrls: ['./browser-overview.component.scss']
})
export class BrowserOverviewComponent implements OnInit {
  public nodeType = NodeType;
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  @Input() node: ITreeNode;
  private _imageMeta: IImageMeta;

  constructor(private _activatedRoute: ActivatedRoute,
              private _storageService : EmeraldBackendStorageService,
              private _imageMetadataService : ImageMetadataService)
  { }

  ngOnInit() {
    this._activatedRoute.parent.params.subscribe((params: Params) => {
      const idParam: string = params['id'];
      if (this._isNumberRe.test(idParam)) {
        this.onSelectId(parseInt(idParam));
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

  private onSelectId(id: number) {
    let pr = this._storageService.getNodeById(id);
    pr.then(node => {
      this.node = node;
      let cur = node;
      while (cur) {
        cur.isExpanded = true;
        cur = cur.parent;
      }
      this._storageService.SelectedNode = node;
      this._storageService.SelectedNodeChanged.emit(this._storageService.SelectedNode);
    })
  }
}
