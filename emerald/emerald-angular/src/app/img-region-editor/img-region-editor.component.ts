import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent {
  @ViewChild('regionEditor') el:ElementRef;

  private _angle : number = 0;
  private _selectedNode: ITreeNode;

  constructor() {
  }

  rotateCW(event:any): void {
    $(this.el.nativeElement).selectAreas('destroy');
    ++this._angle;
    setTimeout(() => this.initJQSelectAreas(), 0);
  }

  rotateCCW(event:any): void {
    $(this.el.nativeElement).selectAreas('destroy');
    --this._angle;
    setTimeout(() => this.initJQSelectAreas(), 0);
  }

  get ImageUrl() : string {
    return `/emerald/storage/get-content/${this.SelectedNode.aquamarineId}?rot=${this.Rot}`;
  }

  @Input() set SelectedNode(value: ITreeNode) {
    $(this.el.nativeElement).selectAreas('destroy');
    this._selectedNode = value;
    setTimeout(() => this.initJQSelectAreas(), 0);
  }

  get SelectedNode(): ITreeNode {
    return this._selectedNode;
  }

  get Rot(): string {
    switch (this._angle % 4) {
      case -1:
        return 'CCW90';
      case -2:
        return 'CCW180';
      case -3:
        return 'CCW270';
      case 1:
        return 'CW90';
      case 2:
        return 'CW180';
      case 3:
        return 'CW270';
      default:
        return 'NONE';
    }
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
