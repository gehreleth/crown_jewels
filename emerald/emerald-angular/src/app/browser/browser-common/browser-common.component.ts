import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { BrowserService } from '../../services/browser.service';
import { BrowserView } from '../browser-view';

import { IDimensions } from '../../util/dimensions';
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageMetaEditor } from '../../services/image-meta-editor';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-browser-common',
  templateUrl: './browser-common.component.html',
  styleUrls: ['./browser-common.component.scss']
})
export class BrowserCommonComponent {
  public nodeType = NodeType;
  public browserView = BrowserView;

  @Input() view: BrowserView;
  private _dimensions: IDimensions;

  constructor(private _sanitizer: DomSanitizer,
              private _browserService: BrowserService)
  { }

  private probeHref(editor: IImageMetaEditor): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(editor.imageMeta));
  }

  private _navLinkClass(view: BrowserView): string {
    return 'nav-link' + ((view === this.view) ? ' active' : '');
  }

  private _routerLink(view: BrowserView, editor: IImageMetaEditor): any[] {
    if (view === this.view) {
      return ['./'];
    } else {
      switch (view) {
        case BrowserView.Selections:
          return ['./selections', {
            page: editor.pageRange.page,
            count: editor.pageRange.count
          }];
        default:
          return ['../'];
      }
    }
  }
}
