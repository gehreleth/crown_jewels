import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';

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
  private _submitHook: (arg: ITaggedImageRegion) => ITaggedImageRegion;

  constructor(private _regionTagsService: RegionTagsService)
  { }

  @Input()
  set region(region: ITaggedImageRegion) {
    this._model = region2model(region);
  }

  @Output() regionChanged = new EventEmitter<ITaggedImageRegion>();

  private _submit(event: any) {
    let r = model2region(this._model);
    this.regionChanged.emit(r);
  }

  private _onAdding = (tag: any) => this._onAdding0(tag);

  private _onAdding0(tag: any): Observable<any> {
    if (tag && tag._orig && tag._orig.href) {
      return Observable.of(tag);
    } else {
      return this._regionTagsService.getTagByName(tag).map(t => tag2model(t));
    }
  }

  private _requestAutocompleteItems = (pattern: any) => this._requestAutocompleteItems0(pattern);

  private _requestAutocompleteItems0(pattern: any): Observable<any> {
    if (pattern.length && pattern.length >= 2) {
      return this._regionTagsService.populateTagsByPattern(pattern).map(
        (tags: Array<ITag>) => tags.map(t => tag2model(t)));
    } else {
      return Observable.of([]);
    }
  }
}

function region2model(arg: ITaggedImageRegion): any {
  return { _orig: arg, text: arg.text, status: arg.status,
    tags: arg.tags.map(t => tag2model(t)) };
}

function tag2model(arg: ITag): any {
  return { _orig: arg, value: arg.href, display: arg.name };
}

function model2region(arg: any): ITaggedImageRegion {
  return { ...arg._orig, text: arg.text, status: arg.status,
    tags: arg.tags.map(mt => mt._orig) };
}
