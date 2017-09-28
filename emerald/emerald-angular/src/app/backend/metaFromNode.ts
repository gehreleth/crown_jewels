import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode, NodeType } from './entities/tree-node';
import { IImageMeta, Rotation } from './entities/image-meta';
import { IImageRegion } from './entities/image-region'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';

import createImageMeta from './createImageMeta'

export default function metaFromNode(http: Http, requestOptions: RequestOptions,
  imageNode: ITreeNode, createIfNone: boolean = true)
    : Observable<IImageMeta>
{
  if (imageNode.type === NodeType.Image) {
    return http.get('/emerald/rest-jpa/image-metadata/search/'
                  + `findOneByStorageNodeId?storage_node_id=${imageNode.id}`)
      .concatMap((rsp: Response) => {
        const dict = rsp.json()
        const rotation = Rotation[dict['rotation'] as string];
        const selfHref = new URL(dict._links.self.href).pathname;
        const regionsHref = new URL(dict._links.regions.href).pathname;
        return http.get(regionsHref).map((rsp: Response) => {
          const regions = IImageRegion.jsonToRegionArray(rsp.json());
          const retVal: IImageMeta = {
            href : selfHref,
            aquamarineId: imageNode.aquamarineId,
            mimeType: imageNode.mimeType,
            contentLength: imageNode.contentLength,
            rotation: rotation,
            regions: regions
          }
          return retVal;
        });
      })
      .catch((err: Error) => {
        return createIfNone
          ? createImageMeta(http, requestOptions, imageNode)
          : Observable.throw(err);
      });
  } else {
    return Observable.throw('Only images are supposed to have metadata');
  }
}
