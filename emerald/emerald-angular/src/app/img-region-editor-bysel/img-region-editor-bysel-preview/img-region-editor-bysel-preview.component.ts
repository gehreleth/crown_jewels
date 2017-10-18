import { Component, Input } from '@angular/core';
import { IImageRegion, RegionStatus } from '../../backend/entities/image-region';
import { ITaggedImageRegion } from '../../backend/entities/tagged-image-region';

@Component({
  selector: 'app-img-region-editor-bysel-preview',
  styles : [`
.tag {
  display: inline-block;
  margin: 4px;
}
`],
  template: `
<div class="row">
  <div class="col-sm-2"><strong>Text</strong></div>
  <div class="col-sm-10">
    <p *ngIf="region.text; else notext">{{region.text}}</p>
    <ng-template #notext>
      <span class="badge badge-danger">None</span>
    </ng-template>
  </div>
</div>
<div class="row">
  <div class="col-sm-2"><strong>Status</strong></div>
  <div class="col-sm-10">
    <span class="{{_statusClass(region.status)}}">{{_statusString(region.status)}}</span>
  </div>
</div>
<div class="row">
  <div class="col-sm-2"><strong>Tags</strong></div>
  <div class="col-sm-10">
    <div *ngFor="let tag of region.tags" class="tag">
      <span class="badge badge-info">{{tag.name}}</span>
    </div>
    <ng-template #notags>
      <span class="badge badge-danger">None</span>
    </ng-template>
  </div>
</div>
`
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
}
