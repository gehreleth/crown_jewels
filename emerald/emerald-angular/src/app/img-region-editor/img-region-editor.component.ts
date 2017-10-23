import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import 'rxjs/add/operator/first';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';

import { ImageMetadataService } from '../services/image-metadata.service';

import { IDimensions } from '../util/dimensions'
import { IArea } from '../ire-main-area/area'

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
  implements OnInit, OnDestroy {

  private readonly _dimensions$ = new ReplaySubject<IDimensions>(1);
  private readonly _areas$ = new ReplaySubject<Array<IArea>>(1);
  private _updateAreasSub: Subscription;

  @Input()
  set dimensions(arg: IDimensions) {
    this._dimensions$.next(arg);
  }

  constructor(private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._updateAreasSub = this._dimensions$.mergeMap(dimensions => {
      return this._imageMetadataService.regions$.map(r => {
        return { 'regions': r, 'dimensions': dimensions };
      })
    }).subscribe(rd => {
      const naturalWidth = rd.dimensions.naturalWidth;
      const clientWidth = rd.dimensions.clientWidth;
      this._areas$.next(r2a(rd.regions, clientWidth / naturalWidth));
    });
  }

  ngOnDestroy() {
    this._updateAreasSub.unsubscribe();
  }

  private _areasChanged(arg: Array<IArea>) {
    this._areas$.next(arg);
  }

  private _rotateCW(event: any): void {
    this._imageMetadataService.rotateCW();
  }

  private _rotateCCW(event:any): void {
    this._imageMetadataService.rotateCCW();
  }

  private get _imageInfo$(): Observable<any> {
    return this._imageMetadataService.imageHref$
      .distinctUntilChanged()
      .mergeMap(href => this._dimensions$.map(dim => {
        return { href: href, width: dim.clientWidth, height: dim.clientHeight };
      }));
  }

  private _saveRegions(event: any): void {
    this._dimensions$.first().mergeMap(dimensions =>
      this._areas$.first().map(areas => {
        const naturalWidth = dimensions.naturalWidth;
        const clientWidth = dimensions.clientWidth;
        this._imageMetadataService.updateRegionsShallow(a2r(areas, naturalWidth / clientWidth));
      }));
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
