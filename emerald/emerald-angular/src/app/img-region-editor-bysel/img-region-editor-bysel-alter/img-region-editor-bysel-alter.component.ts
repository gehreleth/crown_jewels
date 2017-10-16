import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';

interface Wrapper {
  text: any;
  status: any;
}

@Component({
  selector: 'app-img-region-editor-bysel-alter',
  templateUrl: './img-region-editor-bysel-alter.component.html',
  styleUrls: ['./img-region-editor-bysel-alter.component.scss']
})
export class ImgRegionEditorByselAlterComponent implements OnChanges {
  public readonly regionStatus = RegionStatus;

  private readonly _region$ = new ReplaySubject<IImageRegion>(1);

  @Input()
  set region(region: IImageRegion) {
    this._region$.next(region);
  }

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    const regionChange = changes.region;
    if (regionChange) {
      this._region$.next(regionChange.currentValue as IImageRegion);
    }
  }

  private get _region(): Observable<Wrapper> {
    return this._region$.map(r => {
      return {
        get text(): any { return r.text; },
        set text(value: any) {
          let region0 = { ... r };
          region0.text = value;
          this._region$.next(region0);
        },
        get status(): any { return RegionStatus[r.status]; },
        set status(value: any) {
          let region0 = { ... r };
          region0.status = RegionStatus[value as string];
          this._region$.next(region0);
        }
      }
    });
  }

  private _isStatus(value: string, rs: RegionStatus) {
    return RegionStatus[value] === rs;
  }

  private _setStatus(wrapper: any, event: any) {
    wrapper.status = event.target.value;
  }
}
