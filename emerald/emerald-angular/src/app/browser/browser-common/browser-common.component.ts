import { Component, Input } from '@angular/core';
import { BrowserService } from '../../services/browser.service';
import { BrowserView } from '../browser-view';

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
      <app-browser-common-image [node]="node" [view]="view">
      </app-browser-common-image>
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

  constructor(private _browserService: BrowserService)
  { }
}
