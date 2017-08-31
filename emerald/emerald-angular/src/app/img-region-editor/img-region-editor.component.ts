import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { ImgRegionEditorService, IImageRegion, RegionStatus } from '../img-region-editor.service';
import { AfterViewInit } from '@angular/core';

namespace IImageRegion {
  export function modify(src: IImageRegion, dict: any) : IImageRegion {
    const retVal : IImageRegion = {
      status: RegionStatus.Modified,
      cookie : src.cookie,
      href : src.href,
      text : dict['text'],
      x : dict['x'],
      y : dict['y'],
      width : dict['width'],
      height : dict['height']
    }
    return retVal
  }

  export function createNew(dict: any) : IImageRegion {
    const retVal : IImageRegion = {
      status: RegionStatus.New,
      cookie : dict['id'],
      href : null,
      text : dict['text'],
      x : dict['x'],
      y : dict['y'],
      width : dict['width'],
      height : dict['height']
    }
    return retVal
  }

  export function r2newArea(r : IImageRegion) : any {
    return {
      x: r.x,
      y: r.y,
      z: 0,
      height: r.height,
      width: r.width,
      text: r.text,
      href: r.href.pathname
    };
  }
}

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.scss']
})
export class ImgRegionEditorComponent implements AfterViewInit {
  @ViewChild('regionEditor') el:ElementRef;
  private _imageUrl : string;
  private _enableRegionEditor : boolean = false;

  constructor(private _service : ImgRegionEditorService) { }

  ngAfterViewInit() {
    this._service.ImageUrl.subscribe(value => { this.ImageUrl = value });
    //this._service.Regions.subscribe(value => this.syncRegionsWithBackend(value));
  }

  onRotateCW(event:any): void {
    this._service.rotateCW();
  }

  onRotateCCW(event:any): void {
    this._service.rotateCCW();
  }

  set ImageUrl(val : string) {
    $(this.el.nativeElement).selectAreas('destroy');
    this._imageUrl = val;
    setTimeout(() => this.initJQSelectAreas(), 0);
  }

  get ImageUrl() : string {
    return this._imageUrl;
  }

  @Input()
  set SelectedImageNode(value: ITreeNode) {
    this._enableRegionEditor = false;
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
        if (this._enableRegionEditor) {
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
        }
      },
      onChanging: $.noop
    });
    this._enableRegionEditor = true;
  }

   private onSelectionChanged(event: string, area: any) : void {
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
   }

   private onSelectionDeleted(event: string, id: number) : void {
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
   }
}
