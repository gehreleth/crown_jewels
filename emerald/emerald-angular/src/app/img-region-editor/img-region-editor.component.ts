import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/first';

import { BrowserCommonImageService } from '../services/browser-common-image.service';
import { RegionEditorService } from '../services/region-editor.service';

import { IDimensions } from '../util/dimensions'
import { IArea } from '../ire-main-area/area'
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';

import getBlobUrl from '../util/getBlobUrl';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss'],
  providers: [ RegionEditorService ]
})
export class ImgRegionEditorComponent
  implements IBusyIndicatorHolder, OnInit, OnDestroy {

  busyIndicator: Promise<any> = Promise.resolve(1);

  @Input() imageMeta: IImageMeta;
  @Input() dimensions: IDimensions;

  private _subscription: Subscription;
  private _areasCache: BehaviorSubject<Array<IArea>> =
    new BehaviorSubject<Array<IArea>>(undefined);

  constructor(private _imageService: BrowserCommonImageService,
              private _regionsService: RegionEditorService)
  { }

  ngOnInit() {
    const naturalWidth = this.dimensions.naturalWidth;
    const clientWidth = this.dimensions.clientWidth;
    const func = (regions: Array<IImageRegion>) => r2a(regions, clientWidth / naturalWidth);
    const obs = this._regionsService.regions.map(func);
    this._subscription = obs.subscribe((areas: Array<IArea>) => {
      this._areasCache.next(areas);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const imChange = changes.imageMeta;
    if (imChange) {
      const imageMeta = imChange.currentValue as IImageMeta;
      this._regionsService.setAllRegionsScope(imageMeta, this);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private get _width(): number {
    return this.dimensions.clientWidth;
  }

  private get _height(): number {
    return this.dimensions.clientHeight;
  }

  private get _areas(): Observable<Array<IArea>> {
    return this._areasCache.filter(arr => arr !== undefined);
  }

  private _areasChanged(arg: Array<IArea>) {
    this._areasCache.next(arg);
  }

  private get _imageHref(): string {
    return getBlobUrl(this.imageMeta);
  }

  private _rotateCW(event: any): void {
    this._imageService.rotateCW(this.imageMeta, this);
  }

  private _rotateCCW(event:any): void {
    this._imageService.rotateCCW(this.imageMeta, this);
  }

  private _saveRegions(event: any) : void {
    this._areas.first().subscribe((areas: Array<IArea>) => {
      const naturalWidth = this.dimensions.naturalWidth;
      const clientWidth = this.dimensions.clientWidth;
      this._regionsService.updateRegionsInScope(this.imageMeta,
        a2r(areas, naturalWidth / clientWidth), this);
    });
  }
}

function a2r(arg: Array<IArea>, scale: number): Array<IImageRegion> {
  return arg.map(
    q => {
      let href: string = null;
      if (q.attachment && q.attachment.href) {
        href = q.attachment.href;
      }
      const retVal: IImageRegion = {
        x: q.x * scale,
        y: q.y * scale,
        width: q.width * scale,
        height: q.height * scale,
        text: q.text,
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
        attachment: {
          href: q.href,
        }
      }
      return retVal;
    }
  );
}
