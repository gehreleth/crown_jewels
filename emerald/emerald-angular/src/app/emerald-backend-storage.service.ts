import { Injectable, Input, Output, EventEmitter} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

export enum NodeType { Zip, Folder, Image, Other };
export namespace NodeType {
  export function parse(arg: string) {
    switch (arg) {
      case "Zip":
        return NodeType.Zip;
      case "Folder":
        return NodeType.Folder;
      case "Image":
        return NodeType.Image;
      default:
        return NodeType.Other;
    }
  }
}

export interface ITreeNode {
	id: number;
	name: string;
	children: Array<ITreeNode>;
	isExpanded: boolean;
	parent: ITreeNode;
	type: NodeType;
  aquamarineId: string;
  mimeType: string;
  contentLength: number;
}

enum TrackingStatus { PENDING, SUCCESS, FAIL };
namespace TrackingStatus {
  export function parse(arg: string): TrackingStatus {
    switch (arg) {
      case "PENDING":
      return TrackingStatus.PENDING;
      case "SUCCESS":
      return TrackingStatus.SUCCESS;
      default:
      return TrackingStatus.FAIL;
    }
  }
}

@Injectable()
export class EmeraldBackendStorageService {
  onNewRoots: EventEmitter<void> = new EventEmitter<void>();
  activeNode: Subject<ITreeNode> = new Subject<ITreeNode>();

  constructor(private http: Http) { }

  populateChildren(parent: ITreeNode) : Promise< Array<ITreeNode> > {
    let rsp = parent != null
      ? this.http.get("/emerald/storage/browse/" + parent.id)
      : this.http.get("/emerald/storage/browse");
    return rsp.map((response: Response) => JSON.parse(response.text()))
      .toPromise().then((serverAnswer: any) => {
        let arr = serverAnswer as any[];
        return arr.map((ee:any) => {
          const node : ITreeNode = { id: ee['id'] as number,
          name: ee['text'] as string,
          children: null,
          isExpanded: false,
          parent: parent,
          type: NodeType.parse(ee['type'] as string),
          aquamarineId: ee['aquamarineId'] as string,
          mimeType: ee['mimeType'] as string,
          contentLength: ee['contentLength'] as number
        }
        return node;
      })
  })
}

upload(file: any) {
  let formData = new FormData();
  formData.append('file', file);
  this.http.post('/emerald/storage/submit-content', formData)
  .subscribe((rsp: Response) => {
    console.log(rsp)
    let dict = rsp.json()
    let submitAccepted = dict['success'] as boolean;
    if (submitAccepted) {
      let trackingId = dict['trackingId'] as number;
      this.trackBatchExecution(trackingId);
    }
  });
}

private trackBatchExecution(trackingId: number) {
  this.http.get('/emerald/storage/submit-status/' + trackingId)
  .subscribe((rsp: Response) => {
    console.log(rsp)
    let dict = rsp.json()
    let status = TrackingStatus.parse(dict["status"] as string)
    switch (status) {
      case TrackingStatus.SUCCESS:
      this.onNewRoots.emit()
      break;
      case TrackingStatus.PENDING:
      setTimeout(() => this.trackBatchExecution(trackingId), 5000)
      break;
      case TrackingStatus.FAIL:
      default:
    }
  });
}
}
