import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../tree-node'
import { ImgRegionEditorService } from '../img-region-editor.service';
import { IImageMeta } from '../image-meta';
import { IImageRegion } from '../image-region';
import { OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements OnInit {
  private _imageMeta : IImageMeta = null;
  private _imageHref : string = null;
  Regions = new Array<IImageRegion>();

  constructor(private _service : ImgRegionEditorService) { }

  ngOnInit() {
    this._service.ImageMeta.subscribe(im => {
      if (im != null) { this.updateImageMeta(im); }
    });
  }

  private updateImageMeta(im : IImageMeta) {
    this._imageMeta = im;
    const imageHref = this.ImageHref;
    if (!imageHref || imageHref !== im.imageHref) {
      this._imageHref = im.imageHref;
      let newRegions = new Array<IImageRegion>();
      for (const q of im.regions) {
        const w : IImageRegion = {
          text: q.text, x: q.x, y: q.y,
          width: q.width, height: q.height
        };
        newRegions.push(w);
      }
      this.Regions = newRegions;
    }
  }

  onRotateCW(event:any): void {
    this._service.rotateCW();
  }

  onRotateCCW(event:any): void {
    this._service.rotateCCW();
  }

  onSaveRegions(event: any) : void {
    this._service.saveRegions(this.Regions);
  }

  get ImageHref() : string {
    return this._imageHref;
  }

  @Input()
  set SelectedImageNode(value: ITreeNode) {
    this._service.SelectedImageNode = value;
  }

  get SelectedImageNode() : ITreeNode {
    return this._service.SelectedImageNode;
  }
}
