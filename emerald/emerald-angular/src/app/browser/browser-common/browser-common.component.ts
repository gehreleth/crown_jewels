import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { BrowserService } from '../../services/browser.service';
import { RegionEditorService } from '../../services/region-editor.service';
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta } from '../../backend/entities/image-meta';
import { BrowserView } from '../browser-view';
import { IDimensions } from '../../util/dimensions';

import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-browser-common',
  templateUrl: './browser-common.component.html',
  styleUrls: ['./browser-common.component.scss']
})
export class BrowserCommonComponent implements OnChanges {
  public nodeType = NodeType;
  public browserView = BrowserView;

  @Input() view: BrowserView;
  @Input() dimensions: IDimensions;

  @ViewChild('dimensionProbe') private dimensionProbe: ElementRef;

  constructor(private _sanitizer: DomSanitizer,
              private _browserService: BrowserService,
              private _regionEditor: RegionEditorService)
  { }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if (this.dimensionProbe) {
        const el = this.dimensionProbe.nativeElement;
        const f = function (that: BrowserCommonComponent, el: any) {
          that._regionEditor.updateDimensions({naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight, clientWidth: el.clientWidth,
            clientHeight: el.clientHeight});
        }
        if (el.complete) {
          f(this, el);
        } else {
          el.onload = () => f(this, el);
        }
      }
    }, 0);
  }

  private get safeImageHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(this._regionEditor.imageMeta));
  }

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
