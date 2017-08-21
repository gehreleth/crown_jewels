import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

declare var $:any;
@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent implements AfterViewInit {
  @Input() SelectedNode: ITreeNode;
  @Input() Rot : string;
  @ViewChild('regionEditor') el:ElementRef;
  private angle : number = 0;

  constructor() {
    this.Rot = ImgRegionEditorComponent.convAngle(this.angle);
  }

  rotateCW(event:any): void {
    this.Rot = ImgRegionEditorComponent.convAngle(++this.angle);
  }

  rotateCCW(event:any): void {
    this.Rot = ImgRegionEditorComponent.convAngle(--this.angle);
  }

  ngAfterViewInit() {
       $(this.el.nativeElement).selectAreas({
          minSize: [30, 30],    // Minimum size of a selection
          maxSize: [400, 300],  // Maximum size of a selection
          onChanged: $.noop,    // fired when a selection is released
          onChanging: $.noop    // fired during the modification of a selection
        });
   }

  private static convAngle(arg: number) : string {
    switch (arg % 4) {
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
}
