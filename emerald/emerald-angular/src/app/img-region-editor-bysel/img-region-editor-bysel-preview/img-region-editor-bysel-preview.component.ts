import { Component, Input } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { ITaggedImageRegion } from '../../backend/entities/tagged-image-region';

@Component({
  selector: 'app-img-region-editor-bysel-preview',
  templateUrl: './img-region-editor-bysel-preview.component.html',
  styleUrls: ['./img-region-editor-bysel-preview.component.scss']
})
export class ImgRegionEditorByselPreviewComponent {
  @Input() region: ITaggedImageRegion;

  constructor() { }

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

  private _anyTags(region: ITaggedImageRegion): boolean {
    return region.tags && region.tags.length > 0;
  }
}
