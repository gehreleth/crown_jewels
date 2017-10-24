import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserView } from '../browser-view'
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BrowserPagesService } from '../../services/browser-pages.service';
import { ImageMetadataService, IEnumeratedTaggedRegion } from '../../services/image-metadata.service';
import { IImageRegion } from '../../backend/entities/image-region';
import { IPageRange } from '../../util/page-range';

@Component({
  template: `
  <div *ngIf="_browserPages.pageRange$ | async; let pageRange">
    <app-browser-common [view]="_SELECTIONS" [pageRange]="pageRange">
    </app-browser-common>
  </div>
  `,
  providers: [ BrowserPagesService ]
})
export class BrowserSelectionsComponent implements OnInit, OnDestroy {
  private readonly _SELECTIONS = BrowserView.Selections;
  private readonly _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _numItems: number = 0;
  private _routeSub: Subscription;
  private _regionSub: Subscription;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _browserPages: BrowserPagesService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._regionSub = this._imageMetadataService.regions$.subscribe(regions => {
      this._browserPages.pageRange$.first().subscribe(pageRange => {
        this._numItems = regions.length;
        this._browserPages.setPageRange(numPages(pageRange, this._numItems));
      });
    });

    this._routeSub = this._activatedRoute.params.subscribe(params => {
      let pageRange: IPageRange = this._browserPages.DefPageRange;
      let pageRangeDefined = true;

      let countStr: string = params['count'];
      if (this._isNumberRe.test(countStr)) {
        pageRange.count = parseInt(countStr);
      } else {
        pageRangeDefined = false;
      }

      let pageStr: string = params['page'];
      if (this._isNumberRe.test(pageStr)) {
        pageRange.page = parseInt(pageStr);
      } else {
        pageRangeDefined = false;
      }

      if (pageRangeDefined) {
        this._browserPages.setPageRange(numPages(pageRange, this._numItems));
      } else {
        let p0 = { page: pageRange.page, count: pageRange.count };
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
    this._regionSub.unsubscribe();
  }
}

function numPages(pageRange: IPageRange, numItems: number): IPageRange {
  return { ...pageRange, numPages: Math.ceil(numItems / pageRange.count) };
}
