import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IImageMeta } from '../../backend/entities/image-meta';
import { IImageRegion } from '../../backend/entities/image-region';
import { IEnumeratedImageRegion } from '../enumerated-region';
import { IDimensions } from '../../util/dimensions';

@Component({
  selector: 'app-img-region-editor-bysel-sel',
  templateUrl: './img-region-editor-bysel-sel.component.html',
  styleUrls: ['./img-region-editor-bysel-sel.component.scss']
})
export class ImgRegionEditorByselSelComponent implements OnInit {
  @Input() imageMeta: IImageMeta;
  @Input() region: IEnumeratedImageRegion;
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
