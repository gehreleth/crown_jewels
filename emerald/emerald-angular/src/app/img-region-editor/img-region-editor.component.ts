import { Component, Input, Output, EventEmitter,
  ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../tree-node'
import { ImageMetadataService } from '../image-metadata.service';
import { IImageMeta, Rotation } from '../image-meta';
import { IImageRegion } from '../image-region';
import { OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';
import { IArea } from '../ire-main-area/area'

function a2r(arg: Array<IArea>): Array<IImageRegion> {
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
        x: q.x,
        y: q.y,
        width: q.width,
        height: q.height,
        text: text,
        href: href
      }
      return retVal;
    }
  );
}

function r2a(arg: Array<IImageRegion>): Array<IArea> {
  return arg.map(
    q => {
      const retVal: IArea = {
        x: q.x,
        y: q.y,
        width: q.width,
        height: q.height,
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

  private Width: number = 1400;
  private Height: number = 990;

  ngOnChanges(changes: SimpleChanges) {
    const imageMetaChange = changes['ImageMeta'];
    if (imageMetaChange) {
      const newImageMeta = (imageMetaChange.currentValue as IImageMeta);
      this.UpdatedAreas = r2a(newImageMeta.regions);
      this.Areas = this.UpdatedAreas;
    }
  }

  onAreasChanged(arg: Array<IArea>) {
    this.UpdatedAreas = arg;
  }

  constructor(private _service: ImageMetadataService,
              private _sanitizer: DomSanitizer)
  { }

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
    this._service.assignRegionsAndUpdate(this.ImageMeta, a2r(this.UpdatedAreas))
      .subscribe(im => this.update(im));
  }

  private update(arg: IImageMeta) :void {
    this.ImageMeta = arg;
    this.ImageMetaChange.emit(this.ImageMeta);
  }
}
