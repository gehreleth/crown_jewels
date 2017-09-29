import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IImageMeta } from './entities/image-meta';
import { IImageRegion } from './entities/image-region';

/**
 * @param imageMate instance
 *
 * @returns Array of regions
 */
export default function allRegions(http: Http, imageMeta: IImageMeta)
  : Observable<Array<IImageRegion>>
{
    if (imageMeta && imageMeta.href) {
      return http.get(imageMeta.href).concatMap((rsp : Response) => {
        const dict = rsp.json();
        const regionsHref = new URL(dict._links.regions.href).pathname;
        return http.get(regionsHref).map((rsp: Response) =>
          IImageRegion.jsonToRegionArray(rsp.json()));
      });
   } else {
     return Observable.throw('Provided IImageMeta instance lacks href parameter');
   }
}
