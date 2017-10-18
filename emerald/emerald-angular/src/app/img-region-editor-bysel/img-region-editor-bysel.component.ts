import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

import { ImageMetadataService } from '../services/image-metadata.service';
import { RegionEditorService, IEditorRegion } from '../services/region-editor.service';
import { BrowserPagesService} from '../services/browser-pages.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import { IPageRange } from '../util/page-range';
import { IDimensions } from '../util/dimensions'

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss'],
})
export class ImgRegionEditorByselComponent
  implements IBusyIndicatorHolder, OnInit, OnChanges, OnDestroy {

  busyIndicator: Promise<any> = Promise.resolve(1);

  private _imageMeta$ = new ReplaySubject<IImageMeta>(1);
  private _dimensions$ = new ReplaySubject<IDimensions>(1);
  private _editorPageState$ = new ReplaySubject<IEditorPageState>(1);

  @Input()
  set imageMeta(arg: IImageMeta) {
    this._imageMeta$.next(arg);
  }

  @Input()
  set dimensions(arg: IDimensions) {
    this._dimensions$.next(arg);
  }

  private _imSub: Subscription;
  private _stateSub: Subscription;

  private readonly _linkGenerator = (page: number, count: number) =>
    ['../selections', { page: page, count: count }];

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _imageMetadataService: ImageMetadataService,
              private _regionEditorService: RegionEditorService,
              private _browserPages: BrowserPagesService)
  { }

  ngOnInit() {
    this._imSub = this._imageMeta$
      .distinctUntilChanged((u, v) => u === v, im => im.href)
      .subscribe(imageMeta => {
        this._imageMetadataService.setAllRegionsScope(imageMeta)
      });

    this._stateSub = this._imageMeta$.mergeMap(imageMeta =>
      this._dimensions$.mergeMap(dimensions =>
        this._browserPages.pageRange.mergeMap(pageRange =>
          this._regionEditorService.regions.mergeMap(regions =>
            this._activatedRoute.params.map(params => {
            const start = pageRange.page * pageRange.count;
            let end = start + pageRange.count;
            end = Math.min(end, regions.length);
            let pageRange0 = { ... pageRange };
            pageRange0.numPages = Math.ceil(regions.length / pageRange.count);
            return { rkey: params['r'], pageRange: pageRange0,
              imageMeta: imageMeta, dimensions: dimensions,
              regionsOnPage: regions.slice(start, end)
            };
        }))))).subscribe(s => this._editorPageState$.next(s));
  }

  ngOnChanges(changes: SimpleChanges) {
    const imChange = changes.imageMeta;
    if (imChange) {
      this._imageMeta$.next(imChange.currentValue as IImageMeta);
    }

    const dimChange = changes.dimensions;
    if (dimChange) {
      this._dimensions$.next(dimChange.currentValue as IDimensions);
    }
  }

  ngOnDestroy() {
    this._stateSub.unsubscribe();
    this._imSub.unsubscribe();
  }

  private get _editorPageState(): Observable<IEditorPageState> {
    return this._editorPageState$;
  }

  private _regionChanged(region: IImageRegion) {
    let obs = setBusyIndicator(this, this._imageMetadataService.saveSingleRegion(region));
    obs.subscribe(region => {
      this._regionEditorService.updateRegion(region);
      this._browserPages.pageRange.first().subscribe(pageRange => {
        this._router.navigate(['./', { page: pageRange.page,
          count: pageRange.count }], { relativeTo: this._activatedRoute });
      });
    })
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
  pageRange: IPageRange,
  imageMeta: IImageMeta,
  dimensions: IDimensions,
  regionsOnPage: Array<IEditorRegion>,
};
