import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { IArea } from '../ire-main-area/area'
import { ITreeNode, NodeType } from '../backend/entities/tree-node'
import { IImageMeta, Rotation } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../backend/entities/page-range';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss']
})
export class ImgRegionEditorByselComponent implements OnInit {
  @Input()
  imageMeta: IImageMeta;

  @Input()
  pageRange: IPageRange;

  @Input()
  regions: Array<IImageRegion>;

  @Input()
  imageHref: string;

  constructor() { }

  ngOnInit() {
  }

}
