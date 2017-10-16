import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IEditorByselRegion } from '../editor-bysel-region';
import { IDimensions } from '../../util/dimensions';

@Component({
  selector: 'app-img-region-editor-bysel-sel',
  template: `
<div class="container-fluid">
  <div class="media">
    <app-ire-bs-image class="d-flex mr-3"
      [imageMeta]="imageMeta" [region]="region" [dimensions]="dimensions"
      [width]="300" [height]="300">
    </app-ire-bs-image>
    <div class="media-body" id="body">
      <div *ngIf="!region.active" class="pull-right">
        <button type="button" class="btn btn-primary btn-sm"
          (click)="_editRegion($event, region)">Edit...</button>
      </div>
      <h5>Region {{region.num}}.</h5>
      <small class="text-muted">
        x:{{_x}}, y:{{_y}}, width:{{_width}}, height:{{_height}}
      </small>
      <hr>
      <app-img-region-editor-bysel-alter *ngIf="region.active; else preview"
        [region]="region">
      </app-img-region-editor-bysel-alter>
      <ng-template #preview>
        <app-img-region-editor-bysel-preview [region]="region">
        </app-img-region-editor-bysel-preview>
      </ng-template>
    </div>
  </div>
</div>`,
  styles: [`
#body {
  margin-top: 16px;
}`]
})
export class ImgRegionEditorByselSelComponent implements OnInit {
  @Input() imageMeta: IImageMeta;
  @Input() region: IEditorByselRegion;
  @Input() dimensions: IDimensions;

  constructor(private _router: Router, private _activatedRoute: ActivatedRoute)
  { }

  ngOnInit() { }

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

  private _editRegion(event: any, region: IImageRegion): void {
    this._router.navigate(['./', {
      edit: encodeURI(this.region.href)
    }], { relativeTo: this._activatedRoute });
  }
}
