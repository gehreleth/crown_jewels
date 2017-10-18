import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/first';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';

import { ImageMetadataService } from '../services/image-metadata.service';
import { RegionEditorService } from '../services/region-editor.service'

import { IDimensions } from '../util/dimensions'
import { IArea } from '../ire-main-area/area'

import { IQuery } from '../backend/query';
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion, RegionStatus } from '../backend/entities/image-region';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

import getBlobUrl from '../util/getBlobUrl';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss'],
})
export class ImgRegionEditorComponent
  implements IBusyIndicatorHolder, OnInit, OnChanges, OnDestroy {

  busyIndicator: Promise<any> = Promise.resolve(1);

  private readonly _imageMeta$ = new ReplaySubject<IImageMeta>(1);
  private readonly _dimensions$ = new ReplaySubject<IDimensions>(1);

  @Input()
  set imageMeta(arg: IImageMeta) {
    this._imageMeta$.next(arg);
  }

  @Input()
  set dimensions(arg: IDimensions) {
    this._dimensions$.next(arg);
  }

  private _imSub: Subscription;
  private _updateAreasSub: Subscription;

  private readonly _areas$ = new BehaviorSubject<Array<IArea>>(undefined);

  constructor(private _imageMetadataService: ImageMetadataService,
              private _regionEditorService: RegionEditorService)
  { }

  ngOnInit() {
    this._imSub = this._imageMeta$
      .distinctUntilChanged((u, v) => u === v, im => im.href)
      .subscribe(imageMeta => {
        this._imageMetadataService.setAllRegionsScope(imageMeta)
      });

    this._updateAreasSub = this._dimensions$.mergeMap(dimensions => {
      return this._regionEditorService.regions.map(r => {
        return { 'regions': r, 'dimensions': dimensions };
      })
    }).subscribe(state => this._updateAreas(state.regions, state.dimensions));
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
    this._updateAreasSub.unsubscribe();
    this._imSub.unsubscribe();
  }

  private get _areas(): Observable<Array<IArea>> {
    return this._areas$.filter(q => q !== undefined);
  }

  private _areasChanged(arg: Array<IArea>) {
    this._areas$.next(arg);
  }

  private _rotateCW(event: any): void {
    let obs = this._imageMeta$.first()
      .mergeMap(imageMeta => this._imageMetadataService.rotateCW(imageMeta))
    setBusyIndicator(this, obs)
      .subscribe(imageMeta => this._imageMetadataService.setImageMeta(imageMeta));
  }

  private _rotateCCW(event:any): void {
    let obs = this._imageMeta$.first()
      .mergeMap(imageMeta => this._imageMetadataService.rotateCCW(imageMeta))
    setBusyIndicator(this, obs)
      .subscribe(imageMeta => this._imageMetadataService.setImageMeta(imageMeta));
  }

  private get _imageInfo(): Observable<any> {
    let hrefObs = this._imageMeta$
      .map(im => getBlobUrl(im))
        .distinctUntilChanged((u, v) => u === v);

    return hrefObs.mergeMap(href => this._dimensions$.map(dim => {
      return { href: href, width: dim.clientWidth, height: dim.clientHeight }
    }));
  }

  private _updateAreas(regions: Array<IImageRegion>, dimensions: IDimensions) {
    const naturalWidth = dimensions.naturalWidth;
    const clientWidth = dimensions.clientWidth;
    this._areas$.next(r2a(regions, clientWidth / naturalWidth));
  }

  private _saveRegions(event: any) : void {
    let obs = this._imageMeta$.first().mergeMap(imageMeta =>
      this._imageMetadataService.scope.first().mergeMap(scope =>
        this._dimensions$.first().mergeMap(dimensions =>
          this._areas.first().mergeMap(areas => {
            const naturalWidth = dimensions.naturalWidth;
            const clientWidth = dimensions.clientWidth;
            return this._imageMetadataService.saveRegions(imageMeta, scope,
              a2r(areas, naturalWidth / clientWidth));
          }).map(regions => {
            return { 'regions': regions, 'dimensions': dimensions };
          }))));
    setBusyIndicator(this, obs).subscribe(state =>
      this._updateAreas(state.regions, state.dimensions));
  }
}

function a2r(arg: Array<IArea>, scale: number): Array<IImageRegion> {
  return arg.map(
    q => {
      let href: string = null;
      if (q.attachment && q.attachment.href) {
        href = q.attachment.href;
      }
      let status: RegionStatus = RegionStatus.Default;
      if (q.attachment && q.attachment.status) {
        status = q.attachment.status;
      }
      const retVal: IImageRegion = {
        x: q.x * scale,
        y: q.y * scale,
        width: q.width * scale,
        height: q.height * scale,
        text: q.text,
        status: status,
        href: href
      }
      return retVal;
    }
  );
}

function r2a(arg: Array<IImageRegion>, scale: number): Array<IArea> {
  return arg.map(
    q => {
      const retVal: IArea = {
        x: q.x * scale,
        y: q.y * scale,
        width: q.width * scale,
        height: q.height * scale,
        text: q.text,
        color: status2color(q.status),
        attachment: {
          href: q.href,
          status: q.status
        }
      }
      return retVal;
    }
  );
}

function status2color(status: RegionStatus): string {
  switch (status) {
    case RegionStatus.HighUncertainty:
      return 'red';
    case RegionStatus.LowUncertainty:
      return 'yellow';
    case RegionStatus.HumanVerified:
      return 'green';
    default:
      return null;
  }
}
