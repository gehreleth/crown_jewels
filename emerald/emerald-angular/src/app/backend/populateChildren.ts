import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ITreeNode } from './entities/tree-node';

/**
 * @param parent parent node (a ITreeNode instance, not id) or null for root
 *
 * @returns Array of children
 */
export default function populateChildren(http: Http, parent?: ITreeNode)
  : Observable<Array<ITreeNode>>
{
  return (parent ? http.get(`/emerald/storage/populate-children/${parent.id}`)
                 : http.get('/emerald/storage/populate-root'))
    .map((response: Response) =>
      (response.json() as any[]).map((ee: any) =>
        ITreeNode.fromDict(ee, parent)));
}
