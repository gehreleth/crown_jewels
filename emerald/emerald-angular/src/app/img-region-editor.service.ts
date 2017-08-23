import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './emerald-backend-storage.service'
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

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

export interface IImageRegion {
  id: number;
  text: string;
  left : number;
  top : number;
  right : number;
  bottom : number;
}

export interface IImageMeta {
  id: number;
  imageNode: ITreeNode;
  rotation: Rotation;
  regions: Array<IImageRegion>;
}

@Injectable()
export class ImgRegionEditorService {
  private _blobUrl : BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _nodeSubj : Subject<ITreeNode> = new Subject<ITreeNode>();
  private _imageMeta : BehaviorSubject<IImageMeta> = new BehaviorSubject<IImageMeta>(null);

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.onChangeNode(node));
    this._imageMeta.subscribe(imageMeta => {
      if (imageMeta) {
        this._blobUrl.next(`/emerald/blobs/${imageMeta.imageNode.aquamarineId}`
          + `?rot=${Rotation[imageMeta.rotation]}`);
      }
    });
  }

  set Node(node: ITreeNode) {
    this._nodeSubj.next(node);
  }

  get Node() : ITreeNode {
    return this._imageMeta.getValue().imageNode;
  }

  get ImageUrl() : Observable<string> {
    return this._blobUrl.asObservable();
  }

  rotateCW() : void {
    let im = this._imageMeta.getValue();
    im.rotation = Rotation.rotateCW(im.rotation);
    this._imageMeta.next(im);
  }

  rotateCCW() : void {
    let im = this._imageMeta.getValue();
    im.rotation = Rotation.rotateCCW(im.rotation);
    this._imageMeta.next(im);
  }

  private onChangeNode(node: ITreeNode) : void {
    this.loadImageMetaUrl(node, '/emerald/rest-jpa/image-metadata/search/'
                      + `findOneByStorageNodeId?storage_node_id=${node.id}`,
                      true)
      .subscribe(
        data => this._imageMeta.next(data),
        err => {
          console.log(err);
        }
      );
  }

  private loadImageMetaUrl(node: ITreeNode, url: string,
     createIfNone: boolean) : Observable<IImageMeta>
  {
    return this.http.get(url).map(
      (rsp: Response) => this.loadImageMeta(node, rsp)
    ).catch((err: Error) => {
      return createIfNone
        ? this.createImageMeta(node)
        : Observable.throw(err);
    });
  }

  private createImageMeta(node: ITreeNode) : Observable<IImageMeta> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    let options = new RequestOptions({ headers: headers });
    return this.http.post('/emerald/rest-jpa/image-metadata/',
      JSON.stringify({
        rotation : Rotation[Rotation.NONE],
        storageNode: `/emerald/rest-jpa/storage-node/${node.id}`
      }), options).map(
        (rsp: Response) => this.loadImageMeta(node, rsp)
      );
  }

  private loadImageMeta(node: ITreeNode, rsp: Response) : IImageMeta {
    const dict = rsp.json();
    const retVal : IImageMeta = {
      id: ImgRegionEditorService.extractSelfId(dict),
      imageNode : node,
      rotation: Rotation[dict['rotation'] as string],
      regions: []
    }
    return retVal;
  }

  private static trailingDigits = RegExp("\/(\d+)$").compile();

  private static extractSelfId(dict: any) : number {
    const href = dict._links.self.href as string;
    return parseInt(ImgRegionEditorService.trailingDigits.exec(href)[1]);
  }
}
