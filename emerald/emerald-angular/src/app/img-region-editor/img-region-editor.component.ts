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

/*private syncRegionsWithBackend(regions : Array<IImageRegion>) {
  let regionsToBeAdded = regions.filter(r => !r.cookie);
  if (regionsToBeAdded) {
    let newAreas = regionsToBeAdded.map(r => IImageRegion.r2newArea(r));
    $(this.el.nativeElement).selectAreas('add', regionsToBeAdded);
    setTimeout(() => {
      let regions0 = $(this.el.nativeElement).selectAreas('areas');
      //console.log(regions0);
      //this._service.Regions.next(regions0);
    }, 0);
  }
}*/

 /*private onSelectionChanged(event: string, area: any) : void {
   let regions = this._service.Regions.getValue();
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
   this._service.Regions.next(patchedVal);
 }*/

 /*private onSelectionDeleted(event: string, id: number) : void {
   let regions = this._service.Regions.getValue();
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
   }
 }*/
