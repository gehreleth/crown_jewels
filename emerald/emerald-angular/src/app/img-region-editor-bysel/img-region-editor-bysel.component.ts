import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/interval';

import { ImageMetadataService, IEnumeratedTaggedRegion } from '../services/image-metadata.service';
import { RegionEditorService, IEditorRegion } from '../services/region-editor.service';
import { BrowserPagesService } from '../services/browser-pages.service';
import { RegionTagsService } from '../services/region-tags.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { ITaggedImageRegion } from '../backend/entities/tagged-image-region';

import { IPageRange } from '../util/page-range';
import { IDimensions } from '../util/dimensions';
import { IEnumerated } from '../util/enumerated';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss'],
  providers: [ RegionTagsService ]
})
export class ImgRegionEditorByselComponent implements OnInit, OnDestroy {
  private _dimensions$ = new ReplaySubject<IDimensions>(1);
  private readonly _editorPageState$ = new ReplaySubject<IEditorPageState>(1);
  private _sub: Subscription;

  @Input()
  set dimensions(arg: IDimensions) {
    this._dimensions$.next(arg);
  }

  private readonly _linkGenerator = (page: number, count: number) =>
    ['../selections', { page: page, count: count }];

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _imageMetadataService: ImageMetadataService,
              private _browserPages: BrowserPagesService,
              private _regionTagsService: RegionTagsService)
  { }

  ngOnInit() {
    this._sub = this._dimensions$.mergeMap(dimensions =>
      this._browserPages.pageRange.mergeMap(pageRange =>
        this._imageMetadataService.imageMeta$.mergeMap(imageMeta =>
          this._imageMetadataService.regions$.map(regions => {
            const start = pageRange.page * pageRange.count;
            let end = start + pageRange.count;
            end = Math.min(end, regions.length);
            let rkey: string;
            if (pageRange.context && pageRange.context.has('r')) {
              rkey = pageRange.context.get('r');
            }
            const numPages = Math.ceil(regions.length / pageRange.count);
            return { rkey: rkey,
              imageMeta: imageMeta,
              pageRange: { ...pageRange, numPages: numPages },
              dimensions: dimensions,
              regionsOnPage: regions.slice(start, end)
            };
          })))).subscribe(s => this._editorPageState$.next(s));
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
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

interface IEditorPageState {
  rkey: string,
  imageMeta: IImageMeta;
  pageRange: IPageRange,
  dimensions: IDimensions,
  regionsOnPage: Array<IEnumeratedTaggedRegion>
}
