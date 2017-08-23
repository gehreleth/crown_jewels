import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './emerald-backend-storage.service'
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
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
  BlobUrl : Subject<string> = new Subject<string>();
  private _nodeSubj : Subject<ITreeNode> = new Subject<ITreeNode>();
  private _imageMetaSubj : Subject<IImageMeta> = new Subject<IImageMeta>();
  private _imageMeta : IImageMeta;

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.changeActiveNode(node));
    this._imageMetaSubj.subscribe(imageMeta => {
      this._imageMeta = imageMeta;
      this.reloadBlob();
    });
  }

  set Node(node: ITreeNode) {
    this._nodeSubj.next(node);
  }

  get Node() : ITreeNode {
    return this._imageMeta.imageNode;
  }

  rotateCCW() : void {
    this._imageMeta.rotation = Rotation.rotateCW(this._imageMeta.rotation);
    this.reloadBlob();
  }

  rotateCW() : void {
    this._imageMeta.rotation  = Rotation.rotateCCW(this._imageMeta.rotation);
    this.reloadBlob();
  }

  private changeActiveNode(node: ITreeNode) : void {
    this.loadImageMetaUrl(node, '/emerald/rest-jpa/image-metadata/search/'
                      + `findOneByStorageNodeId?storage_node_id=${node.id}`,
                      true)
      .subscribe(
        data => this._imageMetaSubj.next(data),
        err => {
          console.log('Something went wrong!');
        }
      );
  }

  private loadImageMetaUrl(node: ITreeNode, url: string,
     createIfNone: boolean) : Observable<IImageMeta>
  {
    return this.http.get(url).map(
      (rsp: Response) => this.loadImageMeta(node, rsp)
    ).catch((err: Error) => {
      if (createIfNone) {
        return this.createImageMeta(node);
      } else {
        console.log(err);
        return Observable.throw(err);
      }
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

  private reloadBlob() : void {
    this.BlobUrl.next(`/emerald/blobs/${this._imageMeta.imageNode.aquamarineId}`
      + `?rot=${Rotation[this._imageMeta.rotation]}`);
  }

  private static trailingDigits = RegExp("\/(\d+)$").compile();

  private static extractSelfId(dict: any) : number {
    const href = dict._links.self.href as string;
    return parseInt(ImgRegionEditorService.trailingDigits.exec(href)[1]);
  }
}
