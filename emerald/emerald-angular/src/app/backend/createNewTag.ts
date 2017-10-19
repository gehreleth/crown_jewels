import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITag } from './entities/tag';

export default function createNewTag(http: Http, requestOptions: RequestOptions,
  name: string, description?: string): Observable<ITag>
{
  return http.post('/emerald/rest-jpa/tag',
    JSON.stringify({
      name: name,
      description: description
    }), requestOptions).map((rsp: Response) => {
      const dict = rsp.json()
      const retVal: ITag = {
        href : new URL(dict._links.self.href).pathname,
        name: dict.name,
        description: dict.description
      }
      return retVal;
    })
}
