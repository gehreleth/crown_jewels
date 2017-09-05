import { Component, Input, Output, EventEmitter,
   ViewChild, ElementRef } from '@angular/core';
import { AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { IImageRegion } from '../image-region';

declare var $:any;
@Component({
  selector: 'app-ire-main-area',
  templateUrl: './ire-main-area.component.html',
  styleUrls: ['./ire-main-area.component.scss']
})
export class IreMainAreaComponent implements AfterViewInit, OnChanges {
  @Input() ImageHref: string;
  @ViewChild('regionEditor') el: ElementRef;
  @Input() Regions: ReadonlyArray<IImageRegion>;
  @Output() RegionsChange = new EventEmitter<ReadonlyArray<IImageRegion>>();
  private _jqsaId2RegIndex : Map<number, number>;

  constructor() { }

  ngAfterViewInit() {
    this.initJQSelectAreas();
  }

  ngOnChanges(changes: SimpleChanges) {
    const ihc = changes['ImageHref'];
    if (ihc && ihc.currentValue !== ihc.previousValue) {
      if (!ihc.isFirstChange()) {
        this._jqsaId2RegIndex = null;
        $(this.el.nativeElement).selectAreas('reset');
      }
    }
  }

  private initJQSelectAreas() {
    this._jqsaId2RegIndex = new Map<number, number>();
    $(this.el.nativeElement).selectAreas({
      minSize: [30, 30],        // Minimum size of a selection
      maxSize: [400, 300],      // Maximum size of a selection
      areas: this.Regions.map(
        r => {
          return {text: r.text, x: r.x, y: r.y, width: r.width, height: r.height}
        }),
      onChanged: (event: any, id: any, areas: any) => {
        if (this._jqsaId2RegIndex) {
          this._jqsaId2RegIndex.delete(id);
          this.syncIds(areas as any[]);
        } else if (!(areas && areas.length)) {
          this.addAreas();
        }
      },
      onChanging: $.noop
    });
  }

  private addAreas(): void {
    for (const r of this.Regions) {
      $(this.el.nativeElement).selectAreas('add', {text: r.text,
        x: r.x, y: r.y, width: r.width, height: r.height});
    }
    this._jqsaId2RegIndex = new Map<number, number>();
  }

  private syncIds(areas: any[]): void {
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
