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

function makeDefReqOpts() : RequestOptions {
  let headers = new Headers();
  headers.append('Content-Type', 'application/json;charset=UTF-8');
  return new RequestOptions({ headers: headers });
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
      naturalWidth: null, // This will trigger rescale to fit rotated image
      naturalHeight: null,
      clientWidth: null,
      clientHeight: null,
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
      naturalWidth: null, // This will trigger rescale to fit rotated image
      naturalHeight: null,
      clientWidth: null,
      clientHeight: null,
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
       }), makeDefReqOpts())
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
           naturalWidth: arg.naturalWidth,
           naturalHeight: arg.naturalHeight,
           clientWidth: arg.clientWidth,
           clientHeight: arg.clientHeight,
           rotation: rotation,
           regions: arg.regions
         }
         return retVal;
       });
     } else {
       return Observable.throw("Provided IImageMeta instance lacks href parameter");
     }
  }

  assignRegionsAndUpdate(arg: IImageMeta, regions: Array<IImageRegion>)
    : Observable<IImageMeta>
  {
    if (arg && arg.href) {
      return this.http.patch(arg.href,
       JSON.stringify({
         rotation : Rotation[arg.rotation],
       }), makeDefReqOpts())
       .concatMap((rsp : Response) => {
         const dict = rsp.json();
         const rotation = Rotation[dict['rotation'] as string];
         const selfHref = new URL(dict._links.self.href).pathname;
         const regionsHref = new URL(dict._links.regions.href).pathname;
         return this.http.get(regionsHref).concatMap(
           (rsp : Response) =>
             this.updateRegions(arg, IImageRegion.jsonToRegionArray(rsp.json()), regions)
               .map((updatedRegions: Array<IImageRegion>) => {
                 const retVal: IImageMeta = {
                   href : selfHref,
                   aquamarineId: arg.aquamarineId,
                   mimeType: arg.mimeType,
                   contentLength: arg.contentLength,
                   naturalWidth: arg.naturalWidth,
                   naturalHeight: arg.naturalHeight,
                   clientWidth: arg.clientWidth,
                   clientHeight: arg.clientHeight,
                   rotation: rotation,
                   regions: updatedRegions
                 };
                 return retVal;
               }));
             });
     } else {
       return Observable.throw("Provided IImageMeta instance lacks href parameter");
     }
  }

  private updateRegions(arg: IImageMeta, previousRegions: Array<IImageRegion>,
    currentRegions: Array<IImageRegion>): Observable< Array<IImageRegion> >
  {
    const previousRegionHrefs = new Set<string>(previousRegions.map(q => q.href));
    const currentRegionHrefs = new Set<string>(currentRegions.map(q => q.href));
    let regionsToPost: Array<IImageRegion> = [];
    let regionsToPatch: Array<IImageRegion> = [];
    const regionHrefsToDelete =
      previousRegions.filter(r => !currentRegionHrefs.has(r.href))
      .map(r => r.href);
    for (const r of currentRegions) {
      if (!r.href) {
        regionsToPost.push(r);
      } else if (previousRegionHrefs.has(r.href)) {
        regionsToPatch.push(r);
      }
    }
    return Observable.forkJoin(
      this.updateRegions_post(arg, regionsToPost)
        .concat(this.updateRegions_patch(regionsToPatch))
          .concat(this.updateRegions_delete(regionHrefsToDelete)))
          .map((rsps: Array<Response>) =>
            rsps.map(q => IImageRegion.fromDict(q.json())));
  }

  private updateRegions_post(arg: IImageMeta, regions: Array<IImageRegion>)
    : Array<Observable<Response>>
  {
    let retVal = new Array<Observable<Response>>();
    for (const r of regions) {
      retVal.push(this.http.post('/emerald/rest-jpa/img-region',
        JSON.stringify({
          text: r.text,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          imageMetadata: arg.href
        }), makeDefReqOpts()));
    }
    return retVal;
  }

  private updateRegions_patch(regions: Array<IImageRegion>)
    : Array<Observable<Response>>
  {
    let retVal = new Array<Observable<Response>>();
    for (const r of regions) {
      retVal.push(this.http.patch(r.href,
        JSON.stringify({
          text: r.text,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height
        }), makeDefReqOpts()));
    }
    return retVal;
  }

  private updateRegions_delete(regionHrefs: Array<string>)
    : Array<Observable<Response>>
  {
    let retVal = new Array<Observable<Response>>();
    for (const rh of regionHrefs) {
      retVal.push(this.http.delete(rh));
    }
    return retVal;
  }

  assignDimensions(arg: IImageMeta, naturalWidth: number, naturalHeight: number,
    clientWidth: number, clientHeight: number): Observable<IImageMeta>
  {
    const retVal: IImageMeta = {
      href: arg.href,
      aquamarineId: arg.aquamarineId,
      mimeType: arg.mimeType,
      contentLength: arg.contentLength,
      naturalWidth: naturalWidth,
      naturalHeight: naturalHeight,
      clientWidth: clientWidth,
      clientHeight: clientHeight,
      rotation: arg.rotation,
      regions: arg.regions
    };
    return Observable.of(retVal);
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
      }), makeDefReqOpts())
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
