import { Component, Input } from '@angular/core';
import { ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent {
  @Input() SelectedNode: ITreeNode;
  @Input() Rot: string;
  private angle : number = 0;

  constructor() {
    this.Rot = this.convAngle(this.angle);
  }

  rotateCW(event:any): void {
    this.Rot = this.convAngle(++this.angle);
  }

  rotateCCW(event:any): void {
    this.Rot = this.convAngle(--this.angle);
  }

  private convAngle(arg: number) : string {
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
