import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IImageRegion } from './entities/image-region';
import { ITaggedImageRegion } from './entities/tagged-image-region';
import { ITag } from './entities/tag';

import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/forkJoin';

export default function extendRegionsWithTags(http: Http, regions: Array<IImageRegion>)
  : Observable<Array<ITaggedImageRegion>>
{
  return Observable.forkJoin(regions.map(r => http.get(`${r.href}?projection=brief`)
    .map((rsp: Response) => {
      const dict = rsp.json();
      return { region: r, tagsHref: new URL(dict._links.tags.href).pathname };
    }))).concatMap(pairs => Observable.forkJoin(pairs.map(pair =>
      http.get(`${pair.tagsHref}?projection=full`).map(rsp => {
        let retVal: ITaggedImageRegion = {
          ...pair.region, tags: ITag.fromEmbedded(rsp.json())
        };
        return retVal;
      })
    )));
}
