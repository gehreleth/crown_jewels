import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ViewChild, ElementRef } from '@angular/core';
import { IDimensions } from '../util/dimensions';

@Component({
  selector: 'app-img-dimension-probe',
  styles : [`img {
    opacity: 0;
  }`],
  template: `<img #dimensionProbe class="img-fluid" [src]="href">`
})
export class ImgDimensionProbeComponent implements AfterViewInit {
  @Input() href: SafeUrl;
  @Output() output: EventEmitter<IDimensions> = new EventEmitter<IDimensions>();

  @ViewChild('dimensionProbe') private dimensionProbe: ElementRef;

  ngAfterViewInit() {
    const el = this.dimensionProbe.nativeElement;
    if (el.complete) {
      this.output.emit({naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight, clientWidth: el.clientWidth,
        clientHeight: el.clientHeight});
    } else {
      el.onload = () => {
        this.output.emit({naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight, clientWidth: el.clientWidth,
          clientHeight: el.clientHeight});
      };
    }
  }
}
