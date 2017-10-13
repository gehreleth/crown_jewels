import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/distinctUntilChanged';

import { RegionEditorService } from '../services/region-editor.service';
import { BrowserPagesService } from '../services/browser-pages.service';

import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IQuery } from '../backend/query';

import { IPageRange } from '../util/page-range';
import { IDimensions } from '../util/dimensions'

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss'],
  providers: [ RegionEditorService ]
})
export class ImgRegionEditorByselComponent implements OnInit, OnDestroy {
  @Input() imageMeta: IImageMeta;
  @Input() dimensions: IDimensions;

  private _regionsInScopeSub: Subscription;
  private _regionsOnPageSub: Subscription;

  private readonly _regionsInScope$ = new ReplaySubject<Array<IImageRegion>>(1);
  private readonly _regionsOnPage$ = new ReplaySubject<Array<IImageRegion>>(1);
  private readonly _pageRange$ = new ReplaySubject<IPageRange>(1);

  constructor(private _regionsService: RegionEditorService,
              private _browserPages: BrowserPagesService)
  { }

  ngOnInit() {
    this._regionsInScopeSub = this._regionsService.scope.concatMap(scope => scope())
      .subscribe(regions => {
        this._regionsInScope$.next(regions)
      });

    this._regionsOnPageSub = this._browserPages.pageRange.concatMap(pageRange => {
      return this._regionsInScope$.first().map(regions => {
        const start = pageRange.page * pageRange.count;
        let end = start + pageRange.count;
        end = Math.min(end, regions.length);
        let pageRange0 = { ... pageRange };
        pageRange0.numPages = Math.ceil(regions.length / pageRange.count);
        const retVal = { pageRange: pageRange0,
                         regionsOnPage: regions.slice(start, end) };
        return retVal
      });
    }).subscribe(pageStat => {
        this._pageRange$.next(pageStat.pageRange);
        this._regionsOnPage$.next(pageStat.regionsOnPage);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const imChange = changes.imageMeta;
    if (imChange) {
      const imageMeta = imChange.currentValue as IImageMeta;
      this._regionsService.setAllRegionsScope(imageMeta);
    }
  }

  ngOnDestroy() {
    this._regionsOnPageSub.unsubscribe();
    this._regionsInScopeSub.unsubscribe();
  }

  private get _regionsOnPage(): Observable<Array<IImageRegion>> {
    return this._regionsOnPage$;
  }

  private get _pageRange(): Observable<IPageRange> {
    return this._pageRange$;
  }

  private _prevPageLink(pageRange: IPageRange): any {
    if (pageRange.page > 0) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: pageRange.page - 1,
                                           count: pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private _nextPageLink(pageRange: IPageRange): any {
    if (pageRange.page < (pageRange.numPages - 1)) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: pageRange.page + 1,
                                           count: pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private _pageLinks(pageRange: IPageRange): any[] {
    let retVal: Array<any> = [];
    for (let i = 0; i < pageRange.numPages; ++i) {
      if (i !== pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': '' + (i + 1),
                      'link':  ['../selections', { page: i, count: pageRange.count }]});
      } else {
        retVal.push({ 'class': 'page-item active', 'caption': '' + (i + 1), 'link': ['./']});
      }
    }
    return retVal;
  }
}
