import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode, NodeType } from './entities/tree-node';
import { IImageMeta, Rotation } from './entities/image-meta';
import { IImageRegion } from './entities/image-region'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';

/**
* Performs shallow update of image meta object not touching any external entities
* associated with this image meta via foreign key.
*
* @param arg the meta object being updated.
*
* @returns Observable of the updated meta object.
*/
export default function updateWithoutRegions(http: Http, requestOptions: RequestOptions,
  arg: IImageMeta) : Observable<IImageMeta>
{
  if (arg && arg.href) {
    return http.patch(arg.href,
     JSON.stringify({
       rotation : Rotation[arg.rotation],
     }), requestOptions)
     .map((rsp : Response) => {
       const dict = rsp.json();
       const rotation = Rotation[dict['rotation'] as string];
       const selfHref = new URL(dict._links.self.href).pathname;
       const regionsHref = new URL(dict._links.regions.href).pathname;
       const retVal: IImageMeta = {
         href : selfHref,
         aquamarineId: arg.aquamarineId,
         mimeType: arg.mimeType,
         contentLength: arg.contentLength,
         rotation: rotation
       }
       return retVal;
     });
   } else {
     return Observable.throw('Provided IImageMeta instance lacks href parameter');
   }
}
