import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import { IPageRange } from '../../util/page-range';

import { BrowserView } from '../browser-view';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IDimensions } from '../../util/dimensions';

import { ImageMetadataService } from '../../services/image-metadata.service';
import { IBusyIndicatorHolder } from '../../util/busy-indicator-holder';

import getBlobUrl from '../../util/getBlobUrl';

@Component({
  selector: 'app-browser-common-image',
  templateUrl: './browser-common-image.component.html',
  styleUrls: ['./browser-common-image.component.scss'],
})
export class BrowserCommonImageComponent {

  busyIndicator: Promise<any> = Promise.resolve(1);
  public readonly browserView = BrowserView;

  @Input() view: BrowserView;
  @Input() pageRange: IPageRange;

  private readonly _dimensions$ = new ReplaySubject<IDimensions>(1);

  constructor(private _sanitizer: DomSanitizer,
              private _imageMetadataService: ImageMetadataService)
  { }

  private get _probeHref$(): Observable<SafeUrl> {
    return this._imageMetadataService.imageHref$.map(href =>
      this._sanitizer.bypassSecurityTrustUrl(href));
  }

  private _navLinkClass(view: BrowserView): string {
    return 'nav-link' + ((view === this.view) ? ' active' : '');
  }

  private _probeLoaded(event: any) {
    this._dimensions$.next(makeDimensions(event.target));
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
