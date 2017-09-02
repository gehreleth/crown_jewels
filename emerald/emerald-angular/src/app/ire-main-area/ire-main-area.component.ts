import { Component, Input, Output, EventEmitter,
   ViewChild, ElementRef } from '@angular/core';
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

  @Input() Regions = new Array<IImageRegion>();
  @Output() RegionsChange = new EventEmitter<Array<IImageRegion>>();

  private _jqsaId2RegIndex : Map<number, number>;

  constructor() { }

  ngAfterViewInit() {
    this.initJQSelectAreas();
  }

  @Input()
  set ImageHref(value: string) {
    $(this.el.nativeElement).selectAreas('destroy');
    this._jqsaId2RegIndex = new Map<number, number>();
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
      areas: this.Regions.map(
        r => { return {x: r.x, y: r.y,
          width: r.width, height: r.height}
        }),
      onChanged: (event: any, id: any, areas: any) => {
        this._jqsaId2RegIndex.delete(id);
        this.syncIds(areas as any[]);
     },
      onChanging: $.noop
    });
  }

  private syncIds(areas: any[]) : void {
    let updated = new Array<IImageRegion>();
    let jqsaId2RegIndex = new Map<number, number>();
    this._jqsaId2RegIndex.forEach((value: number, key: number) => {
      jqsaId2RegIndex.set(key, updated.push(this.Regions[value]) - 1);
    });
    for (const area of areas) {
      if (!this._jqsaId2RegIndex.has(area.id)) {
        const val : IImageRegion = {
          text: area.text, x: area.x, y: area.y,
          width: area.width, height: area.height
        }
        jqsaId2RegIndex.set(area.id as number, updated.push(val) - 1);
      }
    }
    this._jqsaId2RegIndex = jqsaId2RegIndex;
    this.Regions = updated;
    this.RegionsChange.emit(this.Regions);
  }
}
