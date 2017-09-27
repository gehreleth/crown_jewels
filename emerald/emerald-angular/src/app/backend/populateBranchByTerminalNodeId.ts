import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ITreeNode } from '../tree-node';

export default function populateBranchByTerminalNodeId(http: Http, id: number)
  : Observable<ITreeNode>
{
  return http.get(`/emerald/storage/populate-branch/${id}`)
    .map((response: Response) =>
      ITreeNode.fromDictRec(response.json(), null));
}
