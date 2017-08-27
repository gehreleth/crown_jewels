import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { ImgRegionEditorService, IImageRegion } from '../img-region-editor.service';
import { AfterViewInit } from '@angular/core';

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent implements AfterViewInit {
  @ViewChild('regionEditor') el:ElementRef;
  private _imageUrl : string;
  private readonly _saId2Url = new Map<number, URL>();
  private readonly _unassignedSaids = new Set<number>();

  constructor(private _service : ImgRegionEditorService) { }

  ngAfterViewInit() {
    this._service.ImageUrl.subscribe(value => { this.ImageUrl = value });
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
    this._service.SelectedImageNode = value;
  }

  get SelectedImageNode() : ITreeNode {
    return this._service.SelectedImageNode;
  }

  private initJQSelectAreas() {
    $(this.el.nativeElement).selectAreas({
      minSize: [30, 30], // Minimum size of a selection
      maxSize: [400, 300],  // Maximum size of a selection
      onChanged: (event: any, id: any, areas: any) => {
        this.onSelectionChanged(event, id, areas) // fired when a selection is released
      },
      onChanging: $.noop    // fired during the modification of a selection
    });
  }

  private onSelectionChanged(event: any, id: any, areas: any) : void {
    if (this._saId2Url.has(id)) {
      // We have this entry on backend
      if (areas[id]) {
        // Area has been changed
        let iir : IImageRegion = {
          href: this._saId2Url.get(id),
          left: areas[id].x,
          top: areas[id].y,
          right: areas[id].x + areas[id].width,
          bottom: areas[id].y + areas[id].height
        };
        this._service.updateRegion(iir);
      } else {
        // Area has been deleted
        this._service.deleteRegion(this._saId2Url.get(id));
        this._saId2Url.delete(id);
      }
    } else {
      //  We don't have this entry on backend yet
      if (!this._unassignedSaids.has(id)) {
        this._unassignedSaids.add(id);
        let iir : IImageRegion = {
          left: areas[id].x,
          top: areas[id].y,
          right: areas[id].x + areas[id].width,
          bottom: areas[id].y + areas[id].height
        };
        this._service.createNewRegion(iir)
        .subscribe(
          (iir0 : IImageRegion) => {
            this._saId2Url.set(id, iir0.href);
          },
          (err: Error) => {
            console.log(err)
          },
          () => {
            this._unassignedSaids.delete(id);
          }
        )
      }
    }
  }
}
