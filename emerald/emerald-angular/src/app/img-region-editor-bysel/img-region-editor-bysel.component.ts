import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

import { ImageMetadataService, IEnumeratedTaggedRegion } from '../services/image-metadata.service';
import { BrowserPagesService } from '../services/browser-pages.service';
import { RegionTagsService } from '../services/region-tags.service';

import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { ITaggedImageRegion } from '../backend/entities/tagged-image-region';

import { IPageRange } from '../util/page-range';
import { IDimensions } from '../util/dimensions';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss'],
  providers: [ RegionTagsService ]
})
export class ImgRegionEditorByselComponent implements OnInit, OnDestroy {
  private _sub: Subscription;

  @Input() set dimensions(arg: IDimensions) {
    this._dimensions = arg;
  }

  private _rkey: string;

  private _imageMeta: IImageMeta;

  private _pageRange: IPageRange;

  private _dimensions: IDimensions;

  private _regionsOnPage: Array<IEnumeratedTaggedRegion>;

  private _prevPageLink: any;

  private _nextPageLink: any;

  private _pageLinks: any;

  constructor(private _imageMetadataService: ImageMetadataService,
              private _browserPages: BrowserPagesService,
              private _regionTagsService: RegionTagsService)
  { }

  ngOnInit() {
    this._sub = this._browserPages.pageRange$.mergeMap(pageRange =>
      this._imageMetadataService.imageMeta$.map(imageMeta => {
        const regions = pageRange.itemsOnPage as Array<IEnumeratedTaggedRegion>;
        return { rkey: pageRange.otherRouteParams.get('r'),
          imageMeta: imageMeta, pageRange: pageRange,
          regionsOnPage: regions };
      })).subscribe(s => {
        setTimeout(() => {
          this._rkey = s.rkey;
          this._imageMeta = s.imageMeta;
          this._pageRange = s.pageRange;
          this._prevPageLink = makePrevPageLink(this._pageRange);
          this._nextPageLink = makeNextPageLink(this._pageRange);
          this._pageLinks = makePageLinks(this._pageRange);
          this._regionsOnPage = s.regionsOnPage;
        }, 0);
      });
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }

  private get _showMainArea(): boolean {
    return (!!this._dimensions) && (!!this._imageMeta) && (!!this._pageRange);
  }

  private get _showPaginator(): boolean {
    return this._pageRange && this._pageRange.numPages > 1;
  }

  private _regionChanged(region: ITaggedImageRegion) {
    this._imageMetadataService.updateRegionDeep(region);
  }

  private _editLink(region: IImageRegion) {
    return ['../selections', { 'r': encodeURI(region.href) }];
  }

  private _x(region: IImageRegion): number {
    return Math.round(region.x);
  }

  private _y(region: IImageRegion): number {
    return Math.round(region.x);
  }

  private _width(region: IImageRegion): number {
    return Math.round(region.width);
  }

  private _height(region: IImageRegion): number {
    return Math.round(region.height);
  }
}

function lg(page: number, count: number): any {
  return ['../selections', { page: page, count: count }];
}

function cg(page: number) {
  return '' + page;
}

function makePrevPageLink(pageRange: IPageRange, prevPageCaption = 'Prev'): any {
  if (pageRange.page > 0) {
    return { 'class': 'page-item',
             'link': lg(pageRange.page - 1, pageRange.count),
             'tabindex': 0,
             'caption': prevPageCaption
           };
  } else {
    return { 'class': 'page-item disabled',
             'link': ['./'],
             'tabindex': -1,
             'caption': prevPageCaption
           };
  }
}

function makeNextPageLink(pageRange: IPageRange, nextPageCaption = 'Next'): any {
  if (pageRange.page < (pageRange.numPages - 1)) {
    return { 'class': 'page-item',
             'link': lg(pageRange.page + 1, pageRange.count),
             'tabindex': 0,
             'caption': nextPageCaption
           };
  } else {
    return { 'class': 'page-item disabled',
             'link': ['./'],
             'tabindex': -1,
             'caption': nextPageCaption
           };
  }
}

function makePageLinks(pageRange: IPageRange): any[] {
  let retVal: Array<any> = [];
  for (let i = 0; i < pageRange.numPages; ++i) {
    if (i !== pageRange.page) {
      retVal.push({ 'class': 'page-item',
                    'caption': cg(i + 1),
                    'link': lg(i, pageRange.count)
                  });
    } else {
      retVal.push({ 'class': 'page-item active',
                    'caption': cg(i + 1),
                    'link': ['./']});
    }
  }
  return retVal;
}
