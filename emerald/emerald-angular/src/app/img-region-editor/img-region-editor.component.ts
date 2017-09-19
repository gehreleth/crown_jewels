import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit, ViewChild, ElementRef } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { IArea } from '../ire-main-area/area'
import { ITreeNode, NodeType } from '../tree-node'
import { ImageMetadataService } from '../image-metadata.service';
import { IImageMeta, Rotation } from '../image-meta';
import { IImageRegion } from '../image-region';

function a2r(arg: Array<IArea>, scale: number): Array<IImageRegion> {
  return arg.map(
    q => {
      let href: string = null;
      if (q.attachment && q.attachment.href) {
        href = q.attachment.href;
      }
      let text: string = null;
      if (q.attachment && q.attachment.text) {
        text = q.attachment.text;
      }
      const retVal: IImageRegion = {
        x: q.x * scale,
        y: q.y * scale,
        width: q.width * scale,
        height: q.height * scale,
        text: text,
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
        attachment: {
          href: q.href,
          text: q.text,
        }
      }
      return retVal;
    }
  );
}

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements OnChanges {
  @Input() ImageMeta : IImageMeta = null;
  @Output() ImageMetaChange = new EventEmitter<IImageMeta>();

  Areas: Array<IArea> = [];
  UpdatedAreas: Array<IArea> = [];

  @ViewChild('dimensionProbe') dimensionProbe: ElementRef;

  constructor(private _service: ImageMetadataService,
              private _sanitizer: DomSanitizer)
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

  private updateDimensions(naturalWidth: number, naturalHeight: number,
    clientWidth: number, clientHeight: number)
  {
    const scale = clientWidth / naturalWidth;
    this.UpdatedAreas = r2a(this.ImageMeta.regions, scale);
    this.Areas = this.UpdatedAreas;
    this._service.assignDimensions(this.ImageMeta, naturalWidth,
      naturalHeight, clientWidth, clientHeight).subscribe(im => this.update(im));
  }

  onAreasChanged(arg: Array<IArea>) {
    this.UpdatedAreas = arg;
  }

  get AquamarineBlobHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl('/emerald/blobs/'
      + `${this.ImageMeta.aquamarineId}`
      + `?rot=${Rotation[this.ImageMeta.rotation]}`);
  }

  onRotateCW(event:any): void {
    this._service.rotateCW(this.ImageMeta).subscribe(im => this.update(im));
  }

  onRotateCCW(event:any): void {
    this._service.rotateCCW(this.ImageMeta).subscribe(im => this.update(im));
  }

  onSaveRegions(event: any) : void {
    const scale = this.ImageMeta.naturalWidth / this.ImageMeta.clientWidth;
    this._service.assignRegionsAndUpdate(this.ImageMeta, a2r(this.UpdatedAreas, scale))
      .subscribe(im => this.update(im));
  }

  private update(arg: IImageMeta) :void {
    this.ImageMeta = arg;
    this.ImageMetaChange.emit(this.ImageMeta);
  }
}
