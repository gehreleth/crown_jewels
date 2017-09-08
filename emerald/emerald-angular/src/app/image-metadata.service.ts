import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './tree-node'
import { Rotation, IImageMeta } from './image-meta'
import { IImageRegion } from './image-region'
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/concatMap';

class Private {
  static jsonUtf8ReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }

  static imageHref(aquamarineId: string, rotation: Rotation): string {
    return `/emerald/blobs/${aquamarineId}?rot=${Rotation[rotation]}`;
  }
}

@Injectable()
export class ImageMetadataService {
  constructor(private http: Http) {
  }

  getMeta(arg: ITreeNode): Observable<IImageMeta> {
    return this.metaFromNode(arg, true);
  }

  rotateCW(arg: IImageMeta) : Observable<IImageMeta> {
    const updRotation = Rotation.rotateCW(arg.rotation)
    const im: IImageMeta = {
      href : arg.href,
      aquamarineId: arg.aquamarineId,
      mimeType: arg.mimeType,
      contentLength: arg.contentLength,
      rotation: updRotation,
      regions: arg.regions
    }
    return this.updateWithoutRegions(im);
  }

  rotateCCW(arg: IImageMeta) : Observable<IImageMeta> {
    const updRotation = Rotation.rotateCCW(arg.rotation)
    const im: IImageMeta = {
      href : arg.href,
      aquamarineId: arg.aquamarineId,
      mimeType: arg.mimeType,
      contentLength: arg.contentLength,
      rotation: updRotation,
      regions: arg.regions
    }
    return this.updateWithoutRegions(im);
  }

  updateWithoutRegions(arg: IImageMeta) : Observable<IImageMeta> {
    if (arg && arg.href) {
      return this.http.patch(arg.href,
       JSON.stringify({
         rotation : Rotation[arg.rotation],
       }), Private.jsonUtf8ReqOpts())
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
           rotation: rotation,
           regions: arg.regions
         }
         return retVal;
       });
     } else {
       return Observable.throw("Provided IImageMeta instance lacks href parameter");
     }
  }

  updateWithRegions(arg: IImageMeta): Observable<IImageMeta> {
    if (arg && arg.href) {
      return this.http.patch(arg.href,
       JSON.stringify({
         rotation : Rotation[arg.rotation],
       }), Private.jsonUtf8ReqOpts())
       .concatMap((rsp : Response) => {
         const dict = rsp.json();
         const rotation = Rotation[dict['rotation'] as string];
         const selfHref = new URL(dict._links.self.href).pathname;
         const regionsHref = new URL(dict._links.regions.href).pathname;
         const putRegionsHref = new URL(dict._links.putRegions.href).pathname;
         return this.http.put(putRegionsHref, IImageRegion.regionArrayToJson(arg.regions))
           .map((rsp : Response) => {
              const dict = rsp.json();
              const regions = IImageRegion.jsonToRegionArray(dict);
              const retVal: IImageMeta = {
                href : selfHref,
                aquamarineId: arg.aquamarineId,
                mimeType: arg.mimeType,
                contentLength: arg.contentLength,
                rotation: rotation,
                regions: regions
              }
              return retVal;
           });
         });
     } else {
       return Observable.throw("Provided IImageMeta instance lacks href parameter");
     }
  }

  private metaFromNode(imageNode: ITreeNode, createIfNone: boolean)
    : Observable<IImageMeta>
  {
    if (imageNode.type === NodeType.Image) {
      return this.http.get('/emerald/rest-jpa/image-metadata/search/'
                    + `findOneByStorageNodeId?storage_node_id=${imageNode.id}`)
        .concatMap((rsp: Response) => {
          const dict = rsp.json()
          const rotation = Rotation[dict['rotation'] as string];
          const selfHref = new URL(dict._links.self.href).pathname;
          const regionsHref = new URL(dict._links.regions.href).pathname;
          return this.http.get(regionsHref).map((rsp: Response) => {
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
            ? this.createImageMeta(imageNode)
            : Observable.throw(err);
        });
    } else {
      return Observable.throw("Only images are supposed to have metadata");
    }
  }

  private createImageMeta(imageNode: ITreeNode): Observable<IImageMeta> {
    return this.http.post('/emerald/rest-jpa/image-metadata/',
      JSON.stringify({
        rotation : Rotation[Rotation.NONE],
        storageNode: `/emerald/rest-jpa/storage-node/${imageNode.id}`
      }), Private.jsonUtf8ReqOpts())
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
          regions: []
        }
        return retVal;
      });
  }
}
