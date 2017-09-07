import { Component, Input, Output, EventEmitter,
  ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../tree-node'
import { ImageMetadataService } from '../image-metadata.service';
import { IImageMeta, Rotation } from '../image-meta';
import { IImageRegion } from '../image-region';
import { OnInit, AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements AfterViewInit {
  @Input() ImageMeta : IImageMeta = null;
  @Output() ImageMetaChange = new EventEmitter<IImageMeta>();

  private Width: number = 1400;
  private Height: number = 990;

  constructor(private _service: ImageMetadataService)
  { }

  get AquamarineBlobHref(): string {
    return '/emerald/blobs/'
      +`${this.ImageMeta.aquamarineId}?rot=${Rotation[this.ImageMeta.rotation]}`
  }

  ngAfterViewInit() {
  }

  onRotateCW(event:any): void {
    this._service.rotateCW(this.ImageMeta).subscribe(im => this.update(im));
  }

  onRotateCCW(event:any): void {
    this._service.rotateCCW(this.ImageMeta).subscribe(im => this.update(im));
  }

  onSaveRegions(event: any) : void {
    this._service.updateWithRegions(this.ImageMeta)
      .subscribe(im => this.update(im));
  }

  private update(arg: IImageMeta) :void {
    this.ImageMeta = arg;
    this.ImageMetaChange.emit(this.ImageMeta);
  }
}
