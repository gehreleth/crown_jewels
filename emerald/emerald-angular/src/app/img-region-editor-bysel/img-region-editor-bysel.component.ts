import { Component, OnInit, Input } from '@angular/core';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../util/page-range';
import { IDimensions } from '../util/dimensions'

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss']
})
export class ImgRegionEditorByselComponent implements OnInit {
  @Input() imageMeta: IImageMeta;
  @Input() dimensions: IDimensions;

  constructor()
  { }

  ngOnInit() {}

  private get _regionsOnPage(): Array<IImageRegion> {
    //return this.regions.slice(start, end);
    return [];
  }

  private get _prevPageLink(): any {
/*
    if (this.pageRange.page > 0) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page - 1,
                                           count: this.pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
    */
    return null;
  }

  private get _nextPageLink(): any {
    /*
    if (this.pageRange.page < (this.pageRange.numPages - 1)) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page + 1,
                                           count: this.pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
    */
    return null;
  }

  private get _pageLinks(): any[] {
    /*
    let retVal: Array<any> = [];
    for (let i = 0; i < this.pageRange.numPages; ++i) {
      if (i !== this.pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': '' + (i + 1),
                      'link':  ['../selections', { page: i, count: this.pageRange.count }]});
      } else {
        retVal.push({ 'class': 'page-item active', 'caption': '' + (i + 1), 'link': ['./']});
      }
    }
    return retVal;
      */
    return null;
  }
}
