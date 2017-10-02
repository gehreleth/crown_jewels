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

  ngOnInit() {}

  private get _prevPageLink(): any {
    if (this.pageRange.page > 0) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page - 1,
                                           count: this.pageRange.count }],
               'enabled': true};
    } else {
      return { 'class': 'page-item disabled',
               'link': ['./'],
               'enabled': false};
    }
  }

  private get _nextPageLink(): any {
    if (this.pageRange.page < Math.floor(this.regions.length / this.pageRange.count)) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page + 1,
                                           count: this.pageRange.count }],
               'enabled': true };
    } else {
      return { 'class': 'page-item disabled',
               'link': ['./'],
               'enabled': false };
    }
  }

  private get _pageLinks(): any[] {
    let retVal: Array<any> = [];
    const numPages = Math.ceil(this.regions.length / this.pageRange.count);
    for (let i = 0; i < numPages; ++i) {
      if (i !== this.pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': '' + (i + 1),
                      'link':  ['../selections', { page: i,
                                                   count: this.pageRange.count }]
                    });
      } else {
        retVal.push({ 'class': 'page-item active',
                      'caption': '' + (i + 1),
                      'link': ['./']
                    });
      }
    }
    return retVal;
  }
}
