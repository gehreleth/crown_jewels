import { Component, Input, OnInit } from '@angular/core';

import { IPageRange } from '../util/page-range';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Input() pageRange: IPageRange;
  @Input() linkGenerator: (page: number, count:number) => any;
  @Input() prevPageCaption: string = 'Next';
  @Input() nextPageCaption: string = 'Prev';
  @Input() captionGenerator: (page: number) => string = (arg) => '' + arg;

  constructor() { }

  ngOnInit() {
    console.log('I am here');
  }

  private get _prevPageLink(): any {
    if (this.pageRange.page > 0) {
      const lg = this.linkGenerator;
      return { 'class': 'page-item',
               'link': lg(this.pageRange.page - 1, this.pageRange.count),
               'tabindex': 0,
               'caption': this.prevPageCaption
             };
    } else {
      return { 'class': 'page-item disabled',
               'link': ['./'],
               'tabindex': -1,
               'caption': this.prevPageCaption
             };
    }
  }

  private get _nextPageLink(): any {
    if (this.pageRange.page < (this.pageRange.numPages - 1)) {
      const lg = this.linkGenerator;
      return { 'class': 'page-item',
               'link': lg(this.pageRange.page + 1, this.pageRange.count),
               'tabindex': 0,
               'caption': this.nextPageCaption
             };
    } else {
      return { 'class': 'page-item disabled',
               'link': ['./'],
               'tabindex': -1,
               'caption': this.nextPageCaption
             };
    }
  }

  private get _pageLinks(): any[] {
    let retVal: Array<any> = [];
    const cg = this.captionGenerator;
    const lg = this.linkGenerator;
    for (let i = 0; i < this.pageRange.numPages; ++i) {
      if (i !== this.pageRange.page) {
        retVal.push({ 'class': 'page-item',
                      'caption': cg(i + 1),
                      'link': lg(i, this.pageRange.count)
                    });
      } else {
        retVal.push({ 'class': 'page-item active',
                      'caption': cg(i + 1),
                      'link': ['./']});
      }
    }
    return retVal;
  }
}
