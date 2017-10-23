import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BrowserService } from '../../services/browser.service';
import { BrowserPagesService } from '../../services/browser-pages.service';
import { ImageMetadataService, IEnumeratedTaggedRegion } from '../../services/image-metadata.service';
import { IImageRegion } from '../../backend/entities/image-region';
import { IPageRange } from '../../util/page-range';

@Component({
  template: `<app-browser-common [view]="_SELECTIONS"></app-browser-common>`,
  providers: [ BrowserPagesService ]
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private readonly _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _routeSub: Subscription;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _browserPages: BrowserPagesService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._routeSub = this._imageMetadataService.regions$.mergeMap(regions =>
       this._activatedRoute.params.map(params => {
         return { 'params': params, 'regions': regions };
       })).subscribe(state => {
         let params: Params = state.params;
         let regions: Array<IEnumeratedTaggedRegion> = state.regions;

         let pageRange: IPageRange = this._browserPages.DefPageRange;
         let pageRangeDefined = true;

         let countStr: string = params['count'];
         if (this._isNumberRe.test(countStr)) {
           pageRange.count = parseInt(countStr);
         } else {
           pageRangeDefined = false;
         }

         const rkey = params['r'];
         if (rkey) {
           for (let i = 0; i < regions.length; i++) {
             if (regions[i].href === rkey) {
               pageRange.page = Math.floor(i / pageRange.count);
               break;
             }
           }
           let ctx = new Map<string, string>();
           ctx.set('r', rkey);
           pageRange.context = ctx;
         }

         let pageStr: string = params['page'];
         if (this._isNumberRe.test(pageStr)) {
           pageRange.page = parseInt(pageStr);
         } else {
           pageRangeDefined = false;
         }

         if (pageRangeDefined) {
           this._browserPages.setPageRange(pageRange);
         } else {
           let p0 = { page: pageRange.page, count: pageRange.count }
           if (rkey) {
             p0 = { ...p0, r: rkey};
           }
           this._router.navigate(['./', p0], { relativeTo: this._activatedRoute });
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
  }
}
