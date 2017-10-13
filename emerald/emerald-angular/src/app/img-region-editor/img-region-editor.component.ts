import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/first';
import 'rxjs/add/operator/filter';

import { ImageMetadataService } from '../services/image-metadata.service';
import { RegionEditorService } from '../services/region-editor.service';

import { IDimensions } from '../util/dimensions'
import { IArea } from '../ire-main-area/area'

import { IQuery } from '../backend/query';
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

import getBlobUrl from '../util/getBlobUrl';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss'],
  providers: [ RegionEditorService ]
})
export class ImgRegionEditorComponent
  implements IBusyIndicatorHolder, OnInit, OnChanges, OnDestroy {

  busyIndicator: Promise<any> = Promise.resolve(1);

  @Input() imageMeta: IImageMeta;
  @Input() dimensions: IDimensions;

  private _imSub: Subscription;
  private _scopeSub: Subscription;

  private readonly _areas$ = new BehaviorSubject<Array<IArea>>(undefined);
  private readonly _imageMeta$ = new ReplaySubject<IImageMeta>(1);

  private _scope: IQuery<Array<IImageRegion>>;

  constructor(private _imageService: ImageMetadataService,
              private _regionsService: RegionEditorService)
  { }

  ngOnInit() {
    this._imSub = this._imageMeta$.subscribe(imageMeta =>
      this._regionsService.setAllRegionsScope(imageMeta));

    this._scopeSub = this._regionsService.scope
      .concatMap(scope => {
        this._scope = scope;
        return setBusyIndicator(this, this._scope())
      }).subscribe(regions => this._updateAreas(regions));
  }

  ngOnChanges(changes: SimpleChanges) {
    const imChange = changes.imageMeta;
    if (imChange) {
      this._imageMeta$.next(imChange.currentValue as IImageMeta);
    }
  }

  ngOnDestroy() {
    this._scopeSub.unsubscribe();
    this._imSub.unsubscribe();
  }

  private get _width(): number {
    return this.dimensions.clientWidth;
  }

  private get _height(): number {
    return this.dimensions.clientHeight;
  }

  private get _areas(): Observable<Array<IArea>> {
    return this._areas$.filter(q => q !== undefined);
  }

  private _areasChanged(arg: Array<IArea>) {
    this._areas$.next(arg);
  }

  private get _imageHref(): string {
    return getBlobUrl(this.imageMeta);
  }

  private _rotateCW(event: any): void {
    let o = setBusyIndicator(this, this._imageService.rotateCW(this.imageMeta));
    o.subscribe(im => this._imageService.setImageMeta(im));
  }

  private _rotateCCW(event:any): void {
    let o = setBusyIndicator(this, this._imageService.rotateCCW(this.imageMeta));
    o.subscribe(im => this._imageService.setImageMeta(im));
  }

  private _updateAreas(regions: Array<IImageRegion>) {
    const naturalWidth = this.dimensions.naturalWidth;
    const clientWidth = this.dimensions.clientWidth;
    this._areas$.next(r2a(regions, clientWidth / naturalWidth));
  }

  private _saveRegions(event: any) : void {
    let that = this;
    this._areas.first().subscribe((areas: Array<IArea>) => {
      const naturalWidth = this.dimensions.naturalWidth;
      const clientWidth = this.dimensions.clientWidth;
      let o = this._regionsService.saveRegions(this.imageMeta, this._scope,
        a2r(areas, naturalWidth / clientWidth));
      setBusyIndicator(that, o).subscribe(areas => that._updateAreas(areas));
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
