import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import { BrowserService } from '../../services/browser.service';
import { BrowserPagesService } from '../../services/browser-pages.service';
import { ImageMetadataService } from '../../services/image-metadata.service';

import { IImageRegion } from '../../backend/entities/image-region';
import { IPageRange } from '../../util/page-range';

import getBlobUrl from '../../util/getBlobUrl';

interface BrowserSelectionsState {
  regions: Array<IImageRegion>;
  href2Region: Map<string, IImageRegion>;
}

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`,
  providers: [ BrowserPagesService ]
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private readonly _isNumberRe: RegExp = new RegExp("^\\d+$");

  private readonly _state$ = new ReplaySubject<BrowserSelectionsState>(1);

  private _regionsCacheSub: Subscription;
  private _routeSub: Subscription;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _imageMetadataService: ImageMetadataService,
              private _browserPages: BrowserPagesService)
  { }

  ngOnInit() {
    this._regionsCacheSub =
      this._imageMetadataService.regionsCache.subscribe(regions => {
        let map = new Map<string, IImageRegion>();
        for (const region of regions) {
          map.set(region.href, region);
        }
        this._state$.next({
          regions: regions,
          href2Region: map
        });
      });

    this._routeSub = this._state$.mergeMap(state =>
       this._activatedRoute.params.map(params => {
         return { 'params': params,
                  'href2Region': state.href2Region,
                  'regions': state.regions };
       })).subscribe(state => {
         let params: Params = state.params;
         let regions: Array<IImageRegion> = state.regions;
         let href2Region: Map<string, IImageRegion> = state.href2Region;

         const edit = params['edit'];
         if (edit && href2Region.has(edit)) {
           let region = href2Region.get(edit);
           let pageRange: IPageRange = this._browserPages.DefPageRange;

           let countStr: string = params['count'];
           if (this._isNumberRe.test(countStr)) {
             pageRange.count = parseInt(countStr);
           }

           for (let i=0; i < regions.length; i++) {
             if (regions[i].href === region.href) {
               pageRange.page = Math.floor(i / pageRange.count);
               break;
             }
           }

           this._imageMetadataService.setActiveRegion(region);
           this._router.navigate(['./', {
             page: pageRange.page,
             count: pageRange.count,
             edit: encodeURI(edit)
           }], { relativeTo: this._activatedRoute });
         } else {
           let pageRange: IPageRange = this._browserPages.DefPageRange;
           let pageRangeDefined = true;

           let pageStr: string = params['page'];
           if (this._isNumberRe.test(pageStr)) {
             pageRange.page = parseInt(pageStr);
           } else {
             pageRangeDefined = false;
           }

           let countStr: string = params['count'];
           if (this._isNumberRe.test(countStr)) {
             pageRange.count = parseInt(countStr);
           } else {
             pageRangeDefined = false;
           }
           if (pageRangeDefined) {
             this._browserPages.setPageRange(pageRange);
           } else {
             this._router.navigate(['./', {
               page: pageRange.page,
               count: pageRange.count
             }], { relativeTo: this._activatedRoute });
           }
         }
       });
  }

  ngOnDestroy() {
    this._routeSub.unsubscribe();
    this._regionsCacheSub.unsubscribe();
  }
}
