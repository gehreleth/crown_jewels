import { Component, OnInit, Input, Output, EventEmitter} from "@angular/core";
import {ITreeNode, NodeType} from '../emerald-backend-storage.service'

@Component({
  selector: 'app-img-region-editor',
  templateUrl: './img-region-editor.component.html',
  styleUrls: ['./img-region-editor.component.css']
})
export class ImgRegionEditorComponent implements OnInit {
  @Input() SelectedNode: ITreeNode;

  constructor() { }

  ngOnInit() {
  }

}
