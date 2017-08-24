import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { ImgRegionEditorService } from '../img-region-editor.service';
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

  constructor(private _service : ImgRegionEditorService) { }

  ngAfterViewInit() {
    this._service.ImageUrl.subscribe(value => {this.ImageUrl = value });
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
      minSize: [30, 30],    // Minimum size of a selection
      maxSize: [400, 300],  // Maximum size of a selection
      onChanged: $.noop,    // fired when a selection is released
      onChanging: $.noop    // fired during the modification of a selection
    });
  }
}
