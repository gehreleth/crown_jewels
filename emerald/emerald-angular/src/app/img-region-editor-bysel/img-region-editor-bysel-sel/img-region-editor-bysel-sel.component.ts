import { Component, Input, OnInit } from '@angular/core';

import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';

@Component({
  selector: 'app-img-region-editor-bysel-sel',
  templateUrl: './img-region-editor-bysel-sel.component.html',
  styleUrls: ['./img-region-editor-bysel-sel.component.scss']
})
export class ImgRegionEditorByselSelComponent implements OnInit {
  @Input() imageMeta: IImageMeta;

  @Input() region: IImageRegion;

  constructor() { }

  ngOnInit() {
  }

}
