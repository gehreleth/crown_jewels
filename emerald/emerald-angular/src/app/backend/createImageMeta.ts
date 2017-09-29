import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode, NodeType } from './entities/tree-node';
import { IImageMeta, Rotation } from './entities/image-meta';
import { IImageRegion } from './entities/image-region'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';

export default function createImageMeta(http: Http, requestOptions: RequestOptions,
  imageNode: ITreeNode) : Observable<IImageMeta>
{
  return http.post('/emerald/rest-jpa/image-metadata/',
    JSON.stringify({
      rotation : Rotation[Rotation.NONE],
      storageNode: `/emerald/rest-jpa/storage-node/${imageNode.id}`
    }), requestOptions)
    .map((rsp: Response) => {
      const dict = rsp.json();
      const selfHref = new URL(dict._links.self.href).pathname;
      const rotation = Rotation[dict['rotation'] as string];
      const regionsHref = new URL(dict._links.regions.href);
      const retVal: IImageMeta = {
        href: selfHref,
        aquamarineId: imageNode.aquamarineId,
        mimeType: imageNode.mimeType,
        contentLength: imageNode.contentLength,
        rotation: rotation,
      }
      return retVal;
    });
}
