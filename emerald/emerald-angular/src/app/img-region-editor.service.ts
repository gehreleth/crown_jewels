import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ImgRegionEditorService {
  BlobUrl : Subject<string> = new Subject<string>();
  private _angle : number = 0;
  private _nodeSubj : Subject<ITreeNode> = new Subject<ITreeNode>();
  private _node : ITreeNode;

  constructor() {
    this._nodeSubj.subscribe(node => this.changeActiveNode(node));
  }

  set Node(node: ITreeNode) {
    this._nodeSubj.next(node);
  }

  get Node() : ITreeNode {
    return this._node;
  }

  rotateCCW() : void {
    --this._angle;
    this.broadcastNewUrl();
  }

  rotateCW() : void {
    ++this._angle;
    this.broadcastNewUrl();
  }

  private changeActiveNode(node: ITreeNode) : void {
    this._node = node;
    this.broadcastNewUrl();
  }

  private broadcastNewUrl() :void {
    this.BlobUrl.next(`/emerald/blobs/${this._node.aquamarineId}?rot=${this._rot}`);
  }

  private get _rot(): string {
    switch (this._angle % 4) {
      case -1:
        return 'CCW90';
      case -2:
        return 'CCW180';
      case -3:
        return 'CCW270';
      case 1:
        return 'CW90';
      case 2:
        return 'CW180';
      case 3:
        return 'CW270';
      default:
        return 'NONE';
    }
  }
}
