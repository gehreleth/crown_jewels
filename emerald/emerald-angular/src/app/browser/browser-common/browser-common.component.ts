import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EmeraldBackendStorageService } from '../../emerald-backend-storage.service'
import { ImageMetadataService } from '../../image-metadata.service'
import { ITreeNode, NodeType } from '../../tree-node'
import { IImageMeta } from '../../image-meta'
import { BrowserView } from '../browser-view'

@Component({
  selector: 'app-browser-common',
  templateUrl: './browser-common.component.html',
  styleUrls: ['./browser-common.component.scss']
})
export class BrowserCommonComponent implements OnInit {
  public nodeType = NodeType;
  public browserView = BrowserView;

  @Input() view: BrowserView;

  constructor(private _storageService : EmeraldBackendStorageService,
              private _imageMetadataService: ImageMetadataService)
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
          return ['./selections', {page: 0, size: 10}];
        default:
          return ['../'];
      }
    }
  }
}
