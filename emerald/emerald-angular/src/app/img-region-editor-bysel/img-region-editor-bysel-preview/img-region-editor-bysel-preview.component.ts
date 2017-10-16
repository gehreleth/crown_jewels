import { Component, Input } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';

@Component({
  selector: 'app-img-region-editor-bysel-preview',
  template: `
<div class="row">
  <div class="col-sm-1"><strong>Text</strong></div>
  <div class="col-sm-11">
    <p *ngIf="region.text; else notext">{{region.text}}</p>
    <ng-template #notext>
      <span class="badge badge-danger">None</span>
    </ng-template>
  </div>
</div>
<div class="row">
  <div class="col-sm-1"><strong>Status</strong></div>
  <div class="col-sm-11">
    <span class="{{_statusClass(region.status)}}">{{_statusString(region.status)}}</span>
  </div>
</div>
`
})
export class ImgRegionEditorByselPreviewComponent {
  @Input() region: IImageRegion;

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
}
