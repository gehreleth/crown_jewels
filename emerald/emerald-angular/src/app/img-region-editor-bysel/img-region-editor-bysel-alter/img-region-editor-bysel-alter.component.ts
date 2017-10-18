import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { IEditorRegion } from '../../services/region-editor.service';

interface Model {
  _region: IEditorRegion;
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
  set region(arg: IEditorRegion) {
    this._model = {
      _region: arg,
      get text(): string {
        return this._region.text;
      },
      set text(value: string) {
        let r = { ... this._region };
        r.text = value;
        this._region = r;
      },
      get status(): RegionStatus {
        return this._region.status;
      },
      set status(value: RegionStatus) {
        console.log(value);
        let r = { ... this._region };
        r.status = value;
        this._region = r;
      }
    };
  }

  @Output() regionChanged = new EventEmitter<IEditorRegion>();

  private _submit(event: any) {
    this.regionChanged.emit(this._model._region);
  }
}
