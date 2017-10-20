import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITag } from './entities/tag';

export default function populateTagsByPattern(http: Http, pattern: string):
  Observable<Array<ITag>>
{
  return http.get(`/emerald/rest-jpa/tag/search/findByNamePattern?name_pattern=${pattern}`)
    .map((rsp: Response) => ITag.fromEmbedded(rsp.json()));
}
