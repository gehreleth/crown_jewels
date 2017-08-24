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
  href: URL;
  text: string;
  left : number;
  top : number;
  right : number;
  bottom : number;
}

export interface IImageMeta {
  href: URL;
  imageNode: ITreeNode;
  rotation: Rotation;
  regions: Array<IImageRegion>;
}

@Injectable()
export class ImgRegionEditorService {
  private readonly _nodeSubj = new Subject<ITreeNode>();
  private readonly _imageUrl = new BehaviorSubject<string>(null);
  private readonly _imageMeta = new BehaviorSubject<IImageMeta>(null);

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.onChangeNode(node));
    this._imageMeta.subscribe(im => {
      if (im) {
        this._imageUrl.next(`/emerald/blobs/${im.imageNode.aquamarineId}`
          + `?rot=${Rotation[im.rotation]}`);
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
    return this._imageUrl.asObservable();
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
    return this.http.get(url)
      .map((rsp: Response) => this.loadImageMeta(node, rsp))
      .catch((err: Error) => {
        return createIfNone
          ? this.createImageMeta(node)
          : Observable.throw(err);
        });
  }

  private createImageMeta(node: ITreeNode) : Observable<IImageMeta> {
    return this.http.post('/emerald/rest-jpa/image-metadata/',
      JSON.stringify({
        rotation : Rotation[Rotation.NONE],
        storageNode: `/emerald/rest-jpa/storage-node/${node.id}`
      }), ImgRegionEditorService.jsonUtf8ReqOpts())
      .map((rsp: Response) => this.loadImageMeta(node, rsp.json()))
      .catch((err: Error) => Observable.throw(err));
  }

  private loadImageMeta(node: ITreeNode, dict: any) : IImageMeta {
    const retVal : IImageMeta = {
      href: new URL(dict._links.self.href),
      imageNode : node,
      rotation: Rotation[dict['rotation'] as string],
      regions: []
    }
    return retVal;
  }

  private static jsonUtf8ReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }
}
