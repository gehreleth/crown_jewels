import { Component, Input } from '@angular/core';
import { OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
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
  private readonly _url$ = new ReplaySubject<SafeUrl>(1);

  constructor(private _sanitizer: DomSanitizer,
              private _imageService: BrowserCommonImageService)
  { }

  ngOnInit() {
    this._subscription = this._imageService.imageMeta.subscribe(imageMeta => {
      const url = this._sanitizer.bypassSecurityTrustUrl(getBlobUrl(imageMeta));
      this._url$.next(url);
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

  private get _probeHref(): Observable<SafeUrl> {
    return this._url$;
  }

  private _navLinkClass(view: BrowserView): string {
    return 'nav-link' + ((view === this.view) ? ' active' : '');
  }

  private _onload(event: any) {
    this._imageService.setDimensions(makeDimensions(event.srcElement));
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

function makeDimensions(ne: any): IDimensions {
  const retVal: IDimensions = {naturalWidth: ne.naturalWidth,
    naturalHeight: ne.naturalHeight, clientWidth: ne.clientWidth,
    clientHeight: ne.clientHeight
  };
  return retVal;
}
