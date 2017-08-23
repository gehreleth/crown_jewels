import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './emerald-backend-storage.service'
import { Http, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';

export enum Rotation {
  NONE = 0,
  CW90 = 1,
  CW180 = 2,
  CW270 = 3,
  CCW90 = -1,
  CCW180 = -2,
  CCW270 = -3
};

export namespace Rotation {
  export function toString(arg: Rotation) : string {
    return Rotation[arg];
  }

  export function fromNumber(arg: number) : Rotation  {
    return (arg % 4) as Rotation;
  }

  export function rotateCW(arg: Rotation) : Rotation  {
    return fromNumber((arg as number) + 1);
  }

  export function rotateCCW(arg: Rotation) : Rotation  {
    return fromNumber((arg as number) - 1);
  }
}

@Injectable()
export class ImgRegionEditorService {
  BlobUrl : Subject<string> = new Subject<string>();
  private _nodeSubj : Subject<ITreeNode> = new Subject<ITreeNode>();
  private _angle : Rotation = 0;
  private _node : ITreeNode;

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.changeActiveNode(node));
  }

  set Node(node: ITreeNode) {
    this._nodeSubj.next(node);
  }

  get Node() : ITreeNode {
    return this._node;
  }

  rotateCCW() : void {
    this._angle = Rotation.rotateCW(this._angle);
    this.reloadBlob();
  }

  rotateCW() : void {
    this._angle = Rotation.rotateCCW(this._angle);
    this.reloadBlob();
  }

  private changeActiveNode(node: ITreeNode) : void {
    this._node = node;
    this.reloadBlob();
    /*this.http.get('/emerald/rest-jpa/image-metadata/search/'
      + `findOneByStorageNodeId?storage_node_id=${this._node.id}`)
      .map(rsp => rsp.json())
      .map(dict => {
        if (dict) {
          this.reinit(dict);
        } else {

        }

      })*/
  }

  private reloadBlob() :void {
    this.BlobUrl.next(`/emerald/blobs/${this._node.aquamarineId}`
      + `?rot=${Rotation[this._angle]}`);
  }
}
