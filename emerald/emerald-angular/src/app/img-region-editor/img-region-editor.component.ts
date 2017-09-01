import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import {
  ImgRegionEditorService,
  IImageMeta,
  IImageRegion,
  RegionStatus
} from '../img-region-editor.service';
import { AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements AfterViewInit {
  @ViewChild('regionEditor') el:ElementRef;
  private _imageMeta : IImageMeta = null;
  private _imageHref = new BehaviorSubject<string>(null);

  constructor(private _service : ImgRegionEditorService) { }

  ngAfterViewInit() {
    this._service.ImageMeta.subscribe(im => {
      if (im != null) { this.updateImageMeta(im); }
    });
  }

  private updateImageMeta(im : IImageMeta) {
    this._imageMeta = im;
    let imageHref = this.ImageHref;
    if (!imageHref || imageHref !== im.imageHref) {
      this._imageHref.next(im.imageHref);
    }
  }

  onRotateCW(event:any): void {
    this._service.rotateCW();
  }

  onRotateCCW(event:any): void {
    this._service.rotateCCW();
  }

  get ImageHref() : string {
    return this._imageHref.getValue();
  }

  @Input()
  set SelectedImageNode(value: ITreeNode) {
    this._service.SelectedImageNode = value;
  }

  get SelectedImageNode() : ITreeNode {
    return this._service.SelectedImageNode;
  }

  private syncRegionsWithBackend(regions : Array<IImageRegion>) {
    /*let regionsToBeAdded = regions.filter(r => !r.cookie);
    if (regionsToBeAdded) {
      let newAreas = regionsToBeAdded.map(r => IImageRegion.r2newArea(r));
      $(this.el.nativeElement).selectAreas('add', regionsToBeAdded);
      setTimeout(() => {
        let regions0 = $(this.el.nativeElement).selectAreas('areas');
        //console.log(regions0);
        //this._service.Regions.next(regions0);
      }, 0);
    }*/
  }

  private initJQSelectAreas() {
    $(this.el.nativeElement).selectAreas({
      minSize: [30, 30],        // Minimum size of a selection
      maxSize: [400, 300],      // Maximum size of a selection
      onChanged: (event: any, id: any, areas: any) => {
        /*if (this._enableRegionEditor) {
          let area : any;
          for (let q of areas) {
            if (q['id'] === id) {
              area = q;
              break;
            }
          }
          if (area) {
            this.onSelectionChanged(event as string, area);
          } else {
            this.onSelectionDeleted(event as string, id as number);
          }
        }*/
      },
      onChanging: $.noop
    });
    //this._enableRegionEditor = true;
  }

   private onSelectionChanged(event: string, area: any) : void {
     /*let regions = this._service.Regions.getValue();
     let region : IImageRegion;
     for (let q of regions) {
       if (q.cookie === area['id']) {
         region = q;
         break;
       }
     }
     let patchedVal : Array<IImageRegion>;
     if (region) {
       region = IImageRegion.modify(region, area);
       patchedVal = regions.map(q => q.cookie !== region.cookie ? q : region);
     } else {
       patchedVal = regions.concat([IImageRegion.createNew(area)]);
     }
     this._service.Regions.next(patchedVal);*/
   }

   private onSelectionDeleted(event: string, id: number) : void {
     /*let regions = this._service.Regions.getValue();
     let region : IImageRegion;
     for (let q of regions) {
       if (q.cookie === id) {
         region = q;
         break;
       }
     }
     if (region) {
       region = {...region};
       region.status = RegionStatus.MarkedForDeletion;
       let patchedVal = regions.map(q => q.cookie !== region.cookie ? q : region);
       this._service.Regions.next(patchedVal);
     }*/
   }
}
