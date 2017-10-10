import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { BrowserCommonImageService } from '../services/browser-common-image.service';
import { RegionEditorService } from '../services/region-editor.service';

import { IDimensions } from '../util/dimensions'
import { IArea } from '../ire-main-area/area'
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import getBlobUrl from '../util/getBlobUrl';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss'],
  providers: [ RegionEditorService ]
})
export class ImgRegionEditorComponent implements OnInit, OnDestroy {
  @Input() imageMeta: IImageMeta;
  @Input() dimensions: IDimensions;

  private _cachedAreasChanged: boolean;
  private _cachedAreas: Array<IArea>;

  constructor(private _imageService: BrowserCommonImageService,
              private _regionsService: RegionEditorService)
  { }

  ngOnInit() {
    this._clearCache();
    this._regionsService.setAllRegionsScope(this.imageMeta);
  }

  ngOnDestroy() { }

  private get _width(): number {
    return this.dimensions.clientWidth;
  }

  private get _height(): number {
    return this.dimensions.clientHeight;
  }

  private get _areas(): Observable<Array<IArea>> {
    if (!this._cachedAreasChanged) {
      const naturalWidth = this.dimensions.naturalWidth;
      const clientWidth = this.dimensions.clientWidth;
      const func = (regions: Array<IImageRegion>) => r2a(regions, clientWidth / naturalWidth);
      return this._regionsService.regions.map(func);
    } else {
      return Observable.of(this._cachedAreas);
    }
  }

  private _areasChanged(arg: Array<IArea>) {
    this._cachedAreasChanged = true;
    this._cachedAreas = arg;
  }

  private get _imageHref(): string {
    return getBlobUrl(this.imageMeta);
  }

  private _rotateCW(event: any): void {
    this._imageService.rotateCW(this.imageMeta);
  }

  private _rotateCCW(event:any): void {
    this._imageService.rotateCCW(this.imageMeta);
  }

  private _saveRegions(event: any) : void {
    if (this._cachedAreasChanged) {
      const naturalWidth = this.dimensions.naturalWidth;
      const clientWidth = this.dimensions.clientWidth;
      this._regionsService.updateRegionsInScope(this.imageMeta,
        a2r(this._cachedAreas, naturalWidth / clientWidth));
      this._clearCache();
    }
  }

  private _clearCache() {
    this._cachedAreas = [];
    this._cachedAreasChanged = false;
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
