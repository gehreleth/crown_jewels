import { Component, OnInit, Input } from '@angular/core';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../backend/entities/page-range';
import { IDimensions } from '../util/dimensions'
import { IImageMetaEditor } from '../services/image-meta-editor';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss']
})
export class ImgRegionEditorByselComponent implements OnInit {
  @Input() editor: IImageMetaEditor
  @Input() dimensions: IDimensions;
  @Input() regions: Array<IImageRegion>;

  constructor()
  { }

  ngOnInit() {}

  private get _prevPageLink(): any {
    const pageRange = this.editor.pageRange;
    if (pageRange.page > 0) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: pageRange.page - 1,
                                           count: pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private get _nextPageLink(): any {
    const pageRange = this.editor.pageRange;
    if (pageRange.page < (pageRange.numPages - 1)) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: pageRange.page + 1,
                                           count: pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private get _pageLinks(): any[] {
    const pageRange = this.editor.pageRange;
    let retVal: Array<any> = [];
    for (let i = 0; i < pageRange.numPages; ++i) {
      if (i !== pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': '' + (i + 1),
                      'link':  ['../selections', { page: i, count: pageRange.count }]});
      } else {
        retVal.push({ 'class': 'page-item active', 'caption': '' + (i + 1), 'link': ['./']});
      }
    }
    return retVal;
  }
}
