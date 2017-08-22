import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { ImgRegionEditorService } from '../img-region-editor.service';
import { Subject } from 'rxjs/Subject';

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent {
  @ViewChild('regionEditor') el:ElementRef;
  ImageUrl : string;

  constructor(private _service : ImgRegionEditorService) {
    _service.BlobUrl.subscribe(value => this.updateImageUrl(value));
  }

  rotateCW(event:any): void {
    this._service.rotateCW();
  }

  rotateCCW(event:any): void {
    this._service.rotateCCW();
  }

  updateImageUrl(val : string) : void {
    $(this.el.nativeElement).selectAreas('destroy');
    this.ImageUrl = val;
    setTimeout(() => this.initJQSelectAreas(), 0);
  }

  @Input() set SelectedNode(value: ITreeNode) {
    this._service.Node = value;
  }

  get SelectedNode() : ITreeNode {
    return this._service.Node;
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
