import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { ITaggedImageRegion } from '../../backend/entities/tagged-image-region';

interface Model {
  _region: ITaggedImageRegion;
  text: any;
  status: any;
}

@Component({
  selector: 'app-img-region-editor-bysel-alter',
  templateUrl: './img-region-editor-bysel-alter.component.html',
  styleUrls: ['./img-region-editor-bysel-alter.component.scss']
})
export class ImgRegionEditorByselAlterComponent  {
  public readonly regionStatus = RegionStatus;
  private _model: Model;

  constructor() { }

  @Input()
  set region(arg: ITaggedImageRegion) {
    this._model = {
      _region: arg,
      get text(): string {
        return this._region.text;
      },
      set text(value: string) {
        this._region = { ...this._region, text: value };
      },
      get status(): RegionStatus {
        return this._region.status;
      },
      set status(value: RegionStatus) {
        this._region = { ...this._region, status: value };
      }
    };
  }

  @Output() regionChanged = new EventEmitter<ITaggedImageRegion>();

  private _submit(event: any) {
    this.regionChanged.emit(this._model._region);
  }
}
