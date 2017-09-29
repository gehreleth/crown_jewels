import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode, NodeType } from './entities/tree-node';
import { IImageMeta, Rotation } from './entities/image-meta';
import { IImageRegion } from './entities/image-region'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';

import updateWithoutRegions from './updateWithoutRegions'

/**
* Updates image meta, sets its default angle to (current angle + 90) MOD 360
*
* @param arg the meta object being updated.
*
* @returns Observable of updated meta object.
*/
export default function rotateCW(http: Http, requestOptions: RequestOptions,
    arg: IImageMeta) : Observable<IImageMeta>
{
  const updRotation = Rotation.rotateCW(arg.rotation)
  const im: IImageMeta = {
    href : arg.href,
    aquamarineId: arg.aquamarineId,
    mimeType: arg.mimeType,
    contentLength: arg.contentLength,
    rotation: updRotation,
    regions: arg.regions
  }
  return updateWithoutRegions(http, requestOptions, im);
}
