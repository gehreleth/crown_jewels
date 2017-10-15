import { Component, Input, OnInit } from '@angular/core';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { IDimensions } from '../../util/dimensions';

@Component({
  selector: 'app-img-region-editor-bysel-sel',
  templateUrl: './img-region-editor-bysel-sel.component.html',
  styleUrls: ['./img-region-editor-bysel-sel.component.scss']
})
export class ImgRegionEditorByselSelComponent implements OnInit {
  @Input() imageMeta: IImageMeta;
  @Input() region: IImageRegion;
  @Input() dimensions: IDimensions;

  constructor() { }

  ngOnInit() {
  }

  private get _x(): number {
    return Math.round(this.region.x);
  }

  private get _y(): number {
    return Math.round(this.region.x);
  }

  private get _width(): number {
    return Math.round(this.region.width);
  }

  private get _height(): number {
    return Math.round(this.region.height);
  }

  private _statusClass(status: RegionStatus): string {
    switch(status) {
      case RegionStatus.HighUncertainty:
        return 'badge badge-danger';
      case RegionStatus.LowUncertainty:
        return 'badge badge-warning';
      case RegionStatus.HumanVerified:
        return 'badge badge-success';
      default:
        return 'badge badge-info';
    }
  }

  private _statusString(status: RegionStatus): string {
    switch(status) {
      case RegionStatus.HighUncertainty:
        return 'High Uncertainty';
      case RegionStatus.LowUncertainty:
        return 'Low Uncertainty';
      case RegionStatus.HumanVerified:
        return 'Verified by Human Operator';
      default:
        return 'Created Interactively';
    }
  }
}
