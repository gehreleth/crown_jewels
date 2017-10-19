import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IImageRegion, RegionStatus } from './entities/image-region';
import { ITaggedImageRegion } from './entities/tagged-image-region';
import { ITag } from './entities/tag';

export default function updateSingleRegion(http: Http, requestOptions: RequestOptions,
  region: ITaggedImageRegion): Observable<ITaggedImageRegion>
{
  return http.patch(region.href,
    JSON.stringify({
      text: region.text,
      x: region.x,
      y: region.y,
      status: RegionStatus[region.status],
      width: region.width,
      height: region.height,
      tags: region.tags.map(t => t.href)
    }), requestOptions)
    .map((rsp: Response) => {
      let dict = rsp.json();
      return { ...IImageRegion.fromDict(dict), tags: ITag.fromEmbedded(dict) };
    });
}
