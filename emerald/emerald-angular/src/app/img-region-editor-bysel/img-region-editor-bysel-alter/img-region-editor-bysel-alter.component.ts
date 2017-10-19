import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';

import 'rxjs/add/observable/of';

import { RegionTagsService } from '../../services/region-tags.service';

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

  constructor(private _regionTagsService: RegionTagsService)
  { }

  @Input()
  set region(arg: ITaggedImageRegion) {
    this._model = {
      _orig: arg,
      text: arg.text,
      status: arg.status,
      tags: arg.tags.map(t => {
        return { value: t.href, display: t.name };
      })
    };
  }

  @Output() regionChanged = new EventEmitter<ITaggedImageRegion>();

  private _submit(event: any) {
    const updatedRegion: ITaggedImageRegion = { ...this._model._orig,
      text: this._model.text, status: this._model.status };
    this.regionChanged.emit(updatedRegion);
  }

  private _onAdding = (tag: string) => this._onAdding0(tag);

  private _onAdding0(tag: string): Observable<any> {
    const confirm = window.confirm(`Do you really want to add the tag "${tag}" ?`);
    if (confirm) {
      return this._regionTagsService.getTagByName(tag).map(t => {
        return { _orig: t, value: t.href, display: t.name };
      });
    } else {
      return new EmptyObservable();
    }
  }
}
