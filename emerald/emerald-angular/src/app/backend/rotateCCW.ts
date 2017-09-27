import { Http, RequestOptions, Response } from '@angular/http';
import { ITreeNode, NodeType } from '../tree-node';
import { IImageMeta, Rotation } from '../image-meta';
import { IImageRegion } from '../image-region'
import { Observable } from 'rxjs/Observable';

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
  const updRotation = Rotation.rotateCCW(arg.rotation)
  const im: IImageMeta = {
    href : arg.href,
    aquamarineId: arg.aquamarineId,
    mimeType: arg.mimeType,
    contentLength: arg.contentLength,
    naturalWidth: null, // This will trigger rescale to fit rotated image
    naturalHeight: null,
    clientWidth: null,
    clientHeight: null,
    rotation: updRotation,
    regions: arg.regions
  }
  return updateWithoutRegions(http, requestOptions, im);
}
