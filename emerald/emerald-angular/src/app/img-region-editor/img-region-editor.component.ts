import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { IDimensions } from './dimensions'
import { IArea } from '../ire-main-area/area'
import { ITreeNode, NodeType } from '../backend/entities/tree-node'
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';

import { RegionEditorService } from './region-editor.service'
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements OnChanges {
  @Input() imageMeta: IImageMeta;
  @Input() imageHref: string;
  @Input() regions: Array<IImageRegion>;
  @Input() dimensions: IDimensions;

  private _cacheValid: boolean;
  private _cachedAreas: Array<IArea>;

  @ViewChild('dimensionProbe') private dimensionProbe: ElementRef;

  constructor(private _sanitizer: DomSanitizer,
              private _regionEditor: RegionEditorService)
  { }

  ngOnChanges(changes: SimpleChanges) {
    const ihChange = changes['imageHref'];
    if (ihChange) {
      const curHref = ihChange.currentValue;
      const prevHref = !ihChange.firstChange ? ihChange.previousValue : null;
      if (curHref !== prevHref) {
        this._regionEditor.updateDimensions(undefined, undefined,
          undefined, undefined);
      }
    }
    this._cacheValid = false;
    setTimeout(() => {
      if (this.dimensionProbe) {
        const el = this.dimensionProbe.nativeElement;
        if (el.complete) {
          this._regionEditor.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        } else {
          el.onload = () => this._regionEditor.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        }
      }
    }, 0);
  }

  private get _areas(): Array<IArea> {
    if (!this._cacheValid) {
      if (this.dimensions && this.dimensions.clientWidth) {
        const naturalWidth = this.dimensions.naturalWidth;
        const clientWidth = this.dimensions.clientWidth;
        this._cachedAreas = r2a(this.regions, clientWidth / naturalWidth);
        this._cacheValid = true;
      } else {
        this._cachedAreas = []; // Cache still invalid
      }
    }
    return this._cachedAreas;
  }


  private areasChanged(arg: Array<IArea>) {
    this._cachedAreas = arg;
  }

  private get safeImageHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(this.imageHref);
  }

  private onRotateCW(event:any): void {
    this._regionEditor.rotateCW();
  }

  private onRotateCCW(event:any): void {
    this._regionEditor.rotateCCW();
  }

  private onSaveRegions(event: any) : void {
    const naturalWidth = this.dimensions.naturalWidth;
    const clientWidth = this.dimensions.clientWidth;
    this._regionEditor.saveRegions(a2r(this._areas, naturalWidth / clientWidth));
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
