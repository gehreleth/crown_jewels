import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ViewChild, ElementRef } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { IArea } from '../ire-main-area/area'
import { ITreeNode, NodeType } from '../backend/entities/tree-node'
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import 'rxjs/add/observable/of';

import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';
import metaFromNode from '../backend/metaFromNode';
import assignRegionsAndUpdate from '../backend/assignRegionsAndUpdate';

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

/**
 * The image dimensions isn't stored at backend, but involved in calculations
 * of the data being sent to the backend, so it's convinient to make a method
 * in the service acting as if they were stored.
 *
 * @param arg meta object being updated - changes won't be sent to backend,
 * but this method will return result as Observable instance.
 *
 * @param naturalWidth image.naturalWidth field extracted from dimensionProbe.
 * @param naturalHeight image.naturalHeigh field extracted from dimensionProbe.
 * @param clientWidth image.clientWidth field extracted from dimensionProbe.
 * @param clientHeight image.clientHeight field extracted from dimensionProbe.
 *
 * @returns Observable of the updated meta object.
 */
function assignDimensions(arg: IImageMeta, naturalWidth: number, naturalHeight: number,
  clientWidth: number, clientHeight: number): Observable<IImageMeta>
{
  const retVal: IImageMeta = {
    href: arg.href,
    aquamarineId: arg.aquamarineId,
    mimeType: arg.mimeType,
    contentLength: arg.contentLength,
    naturalWidth: naturalWidth,
    naturalHeight: naturalHeight,
    clientWidth: clientWidth,
    clientHeight: clientHeight,
    rotation: arg.rotation,
    regions: arg.regions
  };
  return Observable.of(retVal);
}

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements OnChanges {
  @Input() imageMeta : IImageMeta = null;
  @Output() imageMetaChange = new EventEmitter<IImageMeta>();

  private _areas: Array<IArea> = [];
  private _updatedAreas: Array<IArea> = [];

  @ViewChild('dimensionProbe') private dimensionProbe: ElementRef;

  constructor(private _sanitizer: DomSanitizer, private _http: Http)
  { }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(()=>{
      if (this.dimensionProbe) {
        const el = this.dimensionProbe.nativeElement;
        if (el.complete) {
          this.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        } else {
          el.onload = () => this.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        }
      }
    }, 0);
  }

  private get _defReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }

  private updateDimensions(naturalWidth: number, naturalHeight: number,
    clientWidth: number, clientHeight: number)
  {
    const scale = clientWidth / naturalWidth;
    this._updatedAreas = r2a(this.imageMeta.regions, scale);
    this._areas = this._updatedAreas;
    assignDimensions(this.imageMeta, naturalWidth,
      naturalHeight, clientWidth, clientHeight)
        .subscribe(im => this.update(im));
  }

  private areasChanged(arg: Array<IArea>) {
    this._updatedAreas = arg;
  }

  private get aquamarineBlobHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl('/emerald/blobs/'
      + `${this.imageMeta.aquamarineId}`
      + `?rot=${Rotation[this.imageMeta.rotation]}`);
  }

  private onRotateCW(event:any): void {
    rotateCW(this._http, this._defReqOpts, this.imageMeta)
      .subscribe(im => this.update(im));
  }

  private onRotateCCW(event:any): void {
    rotateCCW(this._http, this._defReqOpts, this.imageMeta)
      .subscribe(im => this.update(im));
  }

  private onSaveRegions(event: any) : void {
    const scale = this.imageMeta.naturalWidth / this.imageMeta.clientWidth;
    assignRegionsAndUpdate(this._http, this._defReqOpts, this.imageMeta,
      a2r(this._updatedAreas, scale))
        .subscribe(im => this.update(im));
  }

  private update(arg: IImageMeta) :void {
    this.imageMeta = arg;
    this.imageMetaChange.emit(this.imageMeta);
  }
}
