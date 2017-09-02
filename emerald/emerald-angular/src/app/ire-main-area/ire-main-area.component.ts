import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { IImageRegion } from '../image-region';

declare var $:any;
@Component({
  selector: 'app-ire-main-area',
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss']
})
export class IreMainAreaComponent implements AfterViewInit {
  private _imageHref: string;

  @ViewChild('regionEditor')
  el: ElementRef;

  constructor() { }

/*
(event: any, id: any, areas: any) => {
 if (this._enableRegionEditor) {
   let area : any;
   for (let q of areas) {
     if (q['id'] === id) {
       area = q;
       break;
     }
   }
   if (area) {
     this.onSelectionChanged(event as string, area);
   } else {
     this.onSelectionDeleted(event as string, id as number);
   }
 }
}
*/

  ngAfterViewInit() {
    this.initJQSelectAreas();
  }

  @Input()
  set ImageHref(value: string) {
    $(this.el.nativeElement).selectAreas('destroy');
    this._imageHref = value;
    setTimeout(() => this.initJQSelectAreas());
  }

  get ImageHref() : string {
    return this._imageHref;
  }

  private initJQSelectAreas() {
    $(this.el.nativeElement).selectAreas({
      minSize: [30, 30],        // Minimum size of a selection
      maxSize: [400, 300],      // Maximum size of a selection
      onChanged: $.noop,
      onChanging: $.noop
    });
  }
}
