import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BrowserService } from '../browser.service';
import { RegionEditorService } from './region-editor.service';
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta } from '../../backend/entities/image-meta';
import { BrowserView } from '../browser-view';

@Component({
  selector: 'app-browser-common',
  templateUrl: './browser-common.component.html',
  styleUrls: ['./browser-common.component.scss']
})
export class BrowserCommonComponent implements OnInit {
  public nodeType = NodeType;
  public browserView = BrowserView;

  @Input() view: BrowserView;

  constructor(private _context: BrowserService,
              private _regionEditor: RegionEditorService)
  { }

  ngOnInit() {}

  private _navLinkClass(view: BrowserView): string {
    return 'nav-link' + ((view === this.view) ? ' active' : '');
  }

  private _routerLink(view: BrowserView): any[] {
    if (view === this.view) {
      return ['./'];
    } else {
      switch (view) {
        case BrowserView.Selections:
          return ['./selections', {
            page: this._regionEditor.pageRange.page,
            count: this._regionEditor.pageRange.count
          }];
        default:
          return ['../'];
      }
    }
  }
}
