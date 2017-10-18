import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IImageRegion } from './entities/image-region';
import { ITaggedImageRegion } from './entities/tagged-image-region';
import { ITag } from './entities/tag';

/**
 */
export default function getRegionsTags(http: Http, regions: Array<IImageRegion>)
  : Observable<Array<ITaggedImageRegion>>
{
  return null;
}
