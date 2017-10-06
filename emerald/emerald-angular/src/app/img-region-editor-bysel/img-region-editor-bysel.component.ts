import { Component, OnInit, Input } from '@angular/core';
import { OnChanges, SimpleChanges } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { IPageRange } from '../backend/entities/page-range';
import { IDimensions } from '../browser/dimensions';
import { RegionEditorService } from '../browser/browser-common/region-editor.service'
import { DomSanitizer, SafeUrl, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'app-img-region-editor-bysel',
  templateUrl: './img-region-editor-bysel.component.html',
  styleUrls: ['./img-region-editor-bysel.component.scss']
})
export class ImgRegionEditorByselComponent implements OnInit, OnChanges {
  @Input() imageMeta: IImageMeta;
  @Input() pageRange: IPageRange;
  @Input() regions: Array<IImageRegion>;
  @Input() imageHref: string;
  @Input() dimensions: IDimensions;

  @ViewChild('dimensionProbe') private dimensionProbe: ElementRef;

  constructor(private _regionEditor: RegionEditorService,
              private _sanitizer: DomSanitizer)
  { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const ihChange = changes['imageHref'];
    if (ihChange) {
      const curHref = ihChange.currentValue;
      const prevHref = !ihChange.firstChange ? ihChange.previousValue : null;
      if (curHref !== prevHref) {
        this._regionEditor.updateDimensions(undefined, undefined,
          undefined, undefined);
      }
    }
    setTimeout(() => {
      if (this.dimensionProbe) {
        const el = this.dimensionProbe.nativeElement;
        if (el.complete) {
          this._regionEditor.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        } else {
          el.onload = () => this._regionEditor.updateDimensions(el.naturalWidth,
            el.naturalHeight, el.clientWidth, el.clientHeight);
        }
      }
    }, 0);
  }

  private get safeImageHref(): SafeUrl {
    return this._sanitizer.bypassSecurityTrustUrl(this.imageHref);
  }

  private get _prevPageLink(): any {
    if (this.pageRange.page > 0) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page - 1,
                                           count: this.pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private get _nextPageLink(): any {
    if (this.pageRange.page < (this.pageRange.numPages - 1)) {
      return { 'class': 'page-item',
               'link': ['../selections', { page: this.pageRange.page + 1,
                                           count: this.pageRange.count }],
               'tabindex': 0 };
    } else {
      return { 'class': 'page-item disabled', 'link': ['./'], 'tabindex': -1 };
    }
  }

  private get _pageLinks(): any[] {
    let retVal: Array<any> = [];
    for (let i = 0; i < this.pageRange.numPages; ++i) {
      if (i !== this.pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': '' + (i + 1),
                      'link':  ['../selections', { page: i,
                                                   count: this.pageRange.count }]});
      } else {
        retVal.push({ 'class': 'page-item active', 'caption': '' + (i + 1), 'link': ['./']});
      }
    }
    return retVal;
  }
}
