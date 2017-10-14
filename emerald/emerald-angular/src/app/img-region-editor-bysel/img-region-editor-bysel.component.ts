import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
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

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

interface IEditorPageState {
  pageRange: IPageRange,
  imageMeta: IImageMeta,
  dimensions: IDimensions,
  regionsOnPage: Array<IImageRegion>,
};

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss'],
  providers: [ RegionEditorService ]
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

  constructor(private _regionsService: RegionEditorService,
              private _browserPages: BrowserPagesService)
  { }

  ngOnInit() {
    this._imSub = this._imageMeta$
      .distinctUntilChanged((u, v) => u === v, im => im.href)
      .subscribe(imageMeta => {
        this._regionsService.setAllRegionsScope(imageMeta)
      });

    this._stateSub = this._imageMeta$.mergeMap(imageMeta =>
      this._dimensions$.mergeMap(dimensions =>
        this._browserPages.pageRange.mergeMap(pageRange => {
          let scopeObs = this._regionsService.scope.first().concatMap(scope => scope());
          return setBusyIndicator(this, scopeObs).map(regions => {
            const start = pageRange.page * pageRange.count;
            let end = start + pageRange.count;
            end = Math.min(end, regions.length);
            let pageRange0 = { ... pageRange };
            pageRange0.numPages = Math.ceil(regions.length / pageRange.count);
            const retVal: IEditorPageState = {
              pageRange: pageRange0,
              imageMeta: imageMeta,
              dimensions: dimensions,
              regionsOnPage: regions.slice(start, end)
            }
            return retVal;
          })
        }))).subscribe(s => this._editorPageState$.next(s));
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

  private get _editorPageState(): Observable<IEditorPageState> {
    return this._editorPageState$;
  }

  ngOnDestroy() {
    this._stateSub.unsubscribe();
    this._imSub.unsubscribe();
  }
}
