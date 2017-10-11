import { Component, Input } from '@angular/core';
import { OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { Subscription } from 'rxjs/Subscription';

import { BrowserView } from '../browser-view';
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IDimensions } from '../../util/dimensions';
import { BrowserCommonImageService } from '../../services/browser-common-image.service';

import { IBusyIndicatorHolder } from '../../util/busy-indicator-holder';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-browser-common-image',
  templateUrl: './browser-common-image.component.html',
  styleUrls: ['./browser-common-image.component.scss'],
  providers: [ BrowserCommonImageService ]
})
export class BrowserCommonImageComponent
  implements IBusyIndicatorHolder, OnInit, OnChanges, OnDestroy {

  busyIndicator: Promise<any> = Promise.resolve(1);
  public readonly browserView = BrowserView;

  @Input() node: ITreeNode;
  @Input() view: BrowserView;

  private _subscription: Subscription;

  constructor(private _sanitizer: DomSanitizer,
              private _imageService: BrowserCommonImageService)
  { }

  ngOnInit() {
    let o = this._imageService.imageMeta;
    this._subscription = o.subscribe((imageMeta: IImageMeta) => {
      this._imageService.clearDimensions();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const nodeChange = changes.node;
    if (nodeChange) {
      const node = nodeChange.currentValue as ITreeNode;
      this._imageService.setNode(node, this);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _probeHref(imageMeta: IImageMeta): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(imageMeta));
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
          return ['./selections'];
        default:
          return ['../'];
      }
    }
  }
}
