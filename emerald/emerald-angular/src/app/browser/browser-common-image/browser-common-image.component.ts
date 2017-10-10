import { Component, Input } from '@angular/core';
import { OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { Subscription } from 'rxjs/Subscription';

import { BrowserView } from '../browser-view';
import { ITreeNode, NodeType } from '../../backend/entities/tree-node';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IDimensions } from '../../util/dimensions';
import { BrowserCommonImageService } from '../../services/browser-common-image.service';
import { BrowserPagesService } from '../../services/browser-pages.service';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-browser-common-image',
  templateUrl: './browser-common-image.component.html',
  styleUrls: ['./browser-common-image.component.scss'],
  providers: [ BrowserCommonImageService ]
})
export class BrowserCommonImageComponent implements OnInit, OnChanges, OnDestroy {
  public readonly browserView = BrowserView;

  @Input() node: ITreeNode;
  @Input() view: BrowserView;

  private _subscription: Subscription;

  constructor(private _sanitizer: DomSanitizer,
              private _imageService: BrowserCommonImageService,
              private _paginator: BrowserPagesService)
  { }

  ngOnInit() {
    this._subscription = this._imageService.imageMeta.subscribe((imageMeta: IImageMeta) => {
      this._imageService.clearDimensions();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const nodeChange = changes.node;
    if (nodeChange) {
      this._imageService.setNode(nodeChange.currentValue as ITreeNode);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _probeHref(imageMeta: IImageMeta): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(imageMeta));
  }

  private _setDimensions(dimensions: IDimensions) {
    setTimeout(() =>{
      this._imageService.setDimensions(dimensions); 
    }, 0)
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
            page: this._paginator.pageRange.page,
            count: this._paginator.pageRange.count
          }];
        default:
          return ['../'];
      }
    }
  }
}
