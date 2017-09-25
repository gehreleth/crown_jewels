import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'

@Component({
  selector: 'app-browser-overview',
  styles : [`
#navtabs {
   margin-bottom: 16px;
}
`],
  template: `
<div *ngIf="_storageService.SelectedNode;else noselection">
  <div [ngSwitch]="node.type">
    <div *ngSwitchCase="nodeType.Zip">
      <p>Zip file</p>
    </div>
    <div *ngSwitchCase="nodeType.Folder">
      <p>Folder</p>
    </div>
    <div *ngSwitchCase="nodeType.Image">
      <div id="navtabs">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link active" [routerLink]="['./']">Whole page</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [routerLink]="['./selections', {page: 0, size: 10}]">Selections</a>
          </li>
        </ul>
      </div>
      <div *ngIf="_imageMeta;else nometa">
        <app-img-region-editor [(imageMeta)]="_imageMeta"></app-img-region-editor>
      </div>
      <ng-template #nometa>
        <p>Loading ...</p>
      </ng-template>
    </div>
  </div>
</div>
<ng-template #noselection>
  <p>No selection</p>
</ng-template>
`
})
export class BrowserOverviewComponent implements OnInit {
  public nodeType = NodeType;
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  @Input() node: ITreeNode;
  private _imageMeta: IImageMeta;

  constructor(private _activatedRoute: ActivatedRoute,
              private _storageService : EmeraldBackendStorageService,
              private _imageMetadataService : ImageMetadataService) { }

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
