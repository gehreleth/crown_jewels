import { Component, Input, OnInit } from '@angular/core';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IDimensions } from '../../util/dimensions';
import { IImageMetaEditor } from '../../services/image-meta-editor';

@Component({
  selector: 'app-img-region-editor-bysel-sel',
  templateUrl: './img-region-editor-bysel-sel.component.html',
  styleUrls: ['./img-region-editor-bysel-sel.component.scss']
})
export class ImgRegionEditorByselSelComponent implements OnInit {
  @Input() editor: IImageMetaEditor;
  @Input() region: IImageRegion;
  @Input() dimensions: IDimensions;

  constructor() { }

  ngOnInit() {
  }

}
