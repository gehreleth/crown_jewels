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
      this._imageMetadataService.activeRegion.mergeMap(activeRegion =>
        this._imageMetadataService.regionsCache.map(regions => {
          if (activeRegion) {
            regions = regions.map(r =>
              r.href !== activeRegion.href ? r : activeRegion
            );
          }
          let map = new Map<string, IImageRegion>();
          for (const region of regions) {
            map.set(region.href, region);
          }
          return {
            regions: regions,
            href2Region: map
          }}
        )).subscribe(state => {
          this._state$.next(state);
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
         const save = params['save'];
         if (edit && href2Region.has(edit)) {
           let region = href2Region.get(edit);
           let pageRange: IPageRange = this._browserPages.DefPageRange;

           let countStr: string = params['count'];
           if (this._isNumberRe.test(countStr)) {
             pageRange.count = parseInt(countStr);
           }

           pageRange.page = this._pageOfRegion(region, regions, pageRange.count);
           this._imageMetadataService.setActiveRegion(region);

           this._router.navigate(['./', {
             page: pageRange.page,
             count: pageRange.count,
             edit: encodeURI(edit)
           }], { relativeTo: this._activatedRoute });
         } else if (save && href2Region.has(save)) {
           let region = href2Region.get(save);
           let pageRange: IPageRange = this._browserPages.DefPageRange;

           let countStr: string = params['count'];
           if (this._isNumberRe.test(countStr)) {
             pageRange.count = parseInt(countStr);
           }

           pageRange.page = this._pageOfRegion(region, regions, pageRange.count);
           this._router.navigate(['./', {
             page: pageRange.page,
             count: pageRange.count,
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

  private _pageOfRegion(region: IImageRegion, regions: Array<IImageRegion>, count: number) {
    for (let i=0; i < regions.length; i++) {
      if (regions[i].href === region.href) {
        return Math.floor(i / count);
      }
    }
  }

  ngOnDestroy() {
    this._routeSub.unsubscribe();
    this._regionsCacheSub.unsubscribe();
  }
}
