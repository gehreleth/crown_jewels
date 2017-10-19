import { Http, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITag } from './entities/tag';

import createNewTag from './createNewTag'

export default function getTagByName(http: Http, requestOptions: RequestOptions,
  name: string, createIfNone: boolean = true): Observable<ITag>
{
  return http.get(`/emerald/rest-jpa/tag/search/findOneByName?name=${name}`)
    .map((rsp: Response) => {
      const dict = rsp.json()
      const retVal: ITag = {
        href : new URL(dict._links.self.href).pathname,
        name: dict.name,
        description: dict.description
      }
      return retVal;
    })
    .catch((err: Error) => {
      return createIfNone
        ? createNewTag(http, requestOptions, name)
        : Observable.throw(err);
    });
}
