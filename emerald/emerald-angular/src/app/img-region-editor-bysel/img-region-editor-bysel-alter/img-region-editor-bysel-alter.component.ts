import { Component, Input } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { ImageMetadataService } from '../../services/image-metadata.service';

import { IBusyIndicatorHolder } from '../../util/busy-indicator-holder';
import setBusyIndicator from '../../util/setBusyIndicator';


interface Model {
  _region: IImageRegion;
  text: any;
  status: any;
}

@Component({
  selector: 'app-img-region-editor-bysel-alter',
  templateUrl: './img-region-editor-bysel-alter.component.html',
  styleUrls: ['./img-region-editor-bysel-alter.component.scss']
})
export class ImgRegionEditorByselAlterComponent implements IBusyIndicatorHolder {
  busyIndicator: Promise<any> = Promise.resolve(1);
  public readonly regionStatus = RegionStatus;
  private _model: Model;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _imageMetadataService: ImageMetadataService) { }

  @Input()
  set region(arg: IImageRegion) {
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

  private _submit(event: any) {
    let obs = setBusyIndicator(this,
      this._imageMetadataService.updateSingleRegion(this._model._region));
    obs.subscribe(region => {
      this._imageMetadataService.setActiveRegion(region);
      this._router.navigate(['./', {
        save: encodeURI(region.href)
      }], { relativeTo: this._activatedRoute });
    });
  }
}
