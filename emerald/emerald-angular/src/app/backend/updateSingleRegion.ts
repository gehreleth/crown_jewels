import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IImageRegion, RegionStatus } from './entities/image-region';

export default function updateSingleRegion(http: Http, requestOptions: RequestOptions,
  region: IImageRegion): Observable<IImageRegion>
{
  return http.patch(region.href,
    JSON.stringify({
      text: region.text,
      x: region.x,
      y: region.y,
      status: RegionStatus[region.status],
      width: region.width,
      height: region.height
    }), requestOptions)
    .map((rsp: Response) => IImageRegion.fromDict(rsp.json()));
}
