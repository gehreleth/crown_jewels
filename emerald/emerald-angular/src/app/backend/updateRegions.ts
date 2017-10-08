import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode, NodeType } from './entities/tree-node';
import { IImageMeta, Rotation } from './entities/image-meta';
import { IImageRegion } from './entities/image-region'

import { IQuery } from './query'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/forkJoin';


/**
* Assigns new regions collection to the image meta object and performs deep
* update of regions involving POST, PATCH and DELETE for each region, according
* to its status. If region doesn't have HATEOAS href yet, it it's being inserted via
* POST, otherwise it's being updated via PATCH, and regions didn't found in the provided
* collection, but found at backend will be deleted with DELETE request.
*
* @param arg meta object being updated.
*
* @param regions new regions.
*
* @returns Observable of the updated meta object.
*/
export default function updateRegions(http: Http, requestOptions: RequestOptions,
  imageMeta: IImageMeta, scope: IQuery<Array<IImageRegion>>, currentRegions: Array<IImageRegion>)
    : Observable< Array<IImageRegion> >
{
  return scope().concatMap((previousRegions: Array<IImageRegion>) => {
    const previousRegionHrefs = new Set<string>(previousRegions.map(q => q.href));
    const currentRegionHrefs = new Set<string>(currentRegions.map(q => q.href));
    let regionsToPost: Array<IImageRegion> = [];
    let regionsToPatch: Array<IImageRegion> = [];
    const regionHrefsToDelete =
      previousRegions.filter(r => !currentRegionHrefs.has(r.href)).map(r => r.href);
    for (const r of currentRegions) {
      if (!r.href) {
        regionsToPost.push(r);
      } else if (previousRegionHrefs.has(r.href)) {
        regionsToPatch.push(r);
      }
    }
    return Observable.forkJoin(updateRegions_post(http, requestOptions, imageMeta.href, regionsToPost)
        .concat(updateRegions_patch(http, requestOptions, regionsToPatch))
          .concat(updateRegions_delete(http, regionHrefsToDelete)));
  }).concatMap((responses: Array<Response>) => {
    for (const response of responses) {
      if (!(response.status >= 200 && response.status < 300)) {
        return Observable.throw(`Got HTTP error ${response.status} : ${response.statusText}`);
      }
    }
    return scope();
  });
}

function updateRegions_post(http: Http, requestOptions: RequestOptions,
  imageMetadataHref: string, regions: Array<IImageRegion>)
    : Array<Observable<Response>>
{
  let retVal = new Array<Observable<Response>>();
  for (const r of regions) {
    retVal.push(http.post('/emerald/rest-jpa/img-region',
      JSON.stringify({
        text: r.text,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        imageMetadata: imageMetadataHref
      }), requestOptions));
  }
  return retVal;
}

function updateRegions_patch(http: Http, requestOptions: RequestOptions,
  regions: Array<IImageRegion>): Array<Observable<Response>>
{
  let retVal = new Array<Observable<Response>>();
  for (const r of regions) {
    retVal.push(http.patch(r.href,
      JSON.stringify({
        text: r.text,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height
      }), requestOptions));
  }
  return retVal;
}

function updateRegions_delete(http: Http, regionHrefs: Array<string>)
  : Array<Observable<Response>>
{
  let retVal = new Array<Observable<Response>>();
  for (const rh of regionHrefs) {
    retVal.push(http.delete(rh));
  }
  return retVal;
}
