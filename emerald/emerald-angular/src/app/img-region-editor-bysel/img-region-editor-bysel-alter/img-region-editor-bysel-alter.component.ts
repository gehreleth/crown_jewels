import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { ITaggedImageRegion } from '../../backend/entities/tagged-image-region';
import { ITag } from '../../backend/entities/tag';

@Component({
  selector: 'app-img-region-editor-bysel-alter',
  templateUrl: './img-region-editor-bysel-alter.component.html',
  styleUrls: ['./img-region-editor-bysel-alter.component.scss']
})
export class ImgRegionEditorByselAlterComponent  {
  public readonly regionStatus = RegionStatus;
  private _model: any;

  constructor() { }

  @Input()
  set region(arg: ITaggedImageRegion) {
    this._model = {
      _orig: arg,
      text: arg.text,
      status: arg.status,
      tags: arg.tags.map(t => {
        return {
          id: t.href,
          name: t.name
        };
      })
    };
  }

  @Output() regionChanged = new EventEmitter<ITaggedImageRegion>();

  private _submit(event: any) {
    const updatedRegion: ITaggedImageRegion = {...this._model._orig,
      text: this._model.text, status: this._model.status};
    this.regionChanged.emit(updatedRegion);
  }
}
