import { Component, Input, Output, EventEmitter,
  ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../tree-node'
import { ImageMetadataService } from '../image-metadata.service';
import { IImageMeta } from '../image-meta';
import { IImageRegion } from '../image-region';
import { OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

interface IImgRegionEditorAction {
  (arg: IImageMeta): Observable<IImageMeta>;
}

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements OnInit {
  @Input() ImageMeta : IImageMeta = null;
  @Output() ImageMetaChange = new EventEmitter<IImageMeta>();
  private readonly _actionQueue = new Subject<IImgRegionEditorAction>();
  private Regions: ReadonlyArray<IImageRegion> = new Array<IImageRegion>();

  constructor(private _service: ImageMetadataService,
              private _router: Router)
  { }

  ngOnInit() {
    this._actionQueue.subscribe(
      action => action(this.ImageMeta).subscribe(
        im => {
          this.ImageMeta = im;
          this.ImageMetaChange.emit(this.ImageMeta);
        },
      err => { console.log(err); }
    ));
    this.ImageMetaChange.subscribe(
      im => { this.Regions = im.regions }
    )
  }

  onRotateCW(event:any): void {
    this._actionQueue.next(im => this._service.rotateCW(im));
  }

  onRotateCCW(event:any): void {
    this._actionQueue.next(im => this._service.rotateCCW(im));
  }

  onSaveRegions(event: any) : void {
    this._actionQueue.next(im => this._service.saveRegions(im, this.Regions));
  }
}
