import { Component, Input } from '@angular/core';
import { BrowserService } from '../../services/browser.service';
import { ImageMetadataService } from '../../services/image-metadata.service';
import { BrowserView } from '../browser-view';
import { IPageRange } from '../../util/page-range';
import { NodeType } from '../../backend/entities/tree-node';

@Component({
  selector: 'app-browser-common',
  template: `
<div *ngIf="_browserService.selection | async; else noselection; let node">
  <div [ngSwitch]="node.type">
    <div *ngSwitchCase="nodeType.Zip">
      <p>Zip file</p>
    </div>
    <div *ngSwitchCase="nodeType.Folder">
      <p>Folder</p>
    </div>
    <div *ngSwitchCase="nodeType.Image">
      <div *ngIf="_imageMetadataService.imageMeta$ | async; else nometa">
        <app-browser-common-image [view]="view" [pageRange]=pageRange>
        </app-browser-common-image>
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
`})
export class BrowserCommonComponent {
  public nodeType = NodeType;

  @Input() view: BrowserView;

  @Input() pageRange: IPageRange;

  constructor(private _browserService: BrowserService,
              private _imageMetadataService: ImageMetadataService)
  { }
}
