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

export interface IImageMeta {
  href?: URL;
  imageNode: ITreeNode;
  rotation: Rotation;
}

export interface IImageRegion {
  cookie : any;
  href? : URL;
  text? : string;
  left : number;
  top : number;
  right : number;
  bottom : number;
}

@Injectable()
export class ImgRegionEditorService {
  private readonly _nodeSubj = new Subject<ITreeNode>();
  private readonly _imageUrl = new BehaviorSubject<string>(null);
  private readonly _imageMeta = new BehaviorSubject<IImageMeta>(null);
  private readonly _patchReqQueue = new Subject<() => void>();
  private readonly _regAu = new Set<number>();

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.onChangeNode(node));
    this._imageMeta.subscribe(im => {
      if (im) {
        this._imageUrl.next(`/emerald/blobs/${im.imageNode.aquamarineId}`
          + `?rot=${Rotation[im.rotation]}`);
      }
    });
    this._patchReqQueue.subscribe(arg => arg());
  }

  set SelectedImageNode(node: ITreeNode) {
    this._nodeSubj.next(node);
  }

  get SelectedImageNode() : ITreeNode {
    return this._imageMeta.getValue().imageNode;
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

  get ImageUrl() : Observable<string> {
    return this._imageUrl.asObservable();
  }

  rotateCW() : void {
    let im = this._imageMeta.getValue();
    im.rotation = Rotation.rotateCW(im.rotation);
    this._patchReqQueue.next(() => this.updateRotation(im));
  }

  rotateCCW() : void {
    let im = this._imageMeta.getValue();
    im.rotation = Rotation.rotateCCW(im.rotation);
    this._patchReqQueue.next(() => this.updateRotation(im));
  }

  createNewRegion(newRegion: IImageRegion) : Observable<IImageRegion> {
    return this.http.post('/emerald/rest-jpa/img-region',
      JSON.stringify({
        imageMetadata: this._imageMeta.getValue().href,
        left: newRegion.left,
        top: newRegion.top,
        right: newRegion.right,
        bottom: newRegion.bottom,
      }), ImgRegionEditorService.jsonUtf8ReqOpts())
      .map((rsp: Response) => {
        let dict = rsp.json();
        newRegion.href = new URL(dict._links.self.href);
        return newRegion;
      })
      .catch((err: Error) => {
        console.log(err);
        return Observable.throw(err);
      });
  }

  updateRegion(region: IImageRegion) : void {
    this._patchReqQueue.next(() =>
    {
      this.http.patch(region.href.pathname,
        JSON.stringify({
          left: region.left, top: region.top,
          right: region.right, bottom: region.bottom,
        }), ImgRegionEditorService.jsonUtf8ReqOpts())
        .catch((err: Error) => {
          console.log(err);
          return Observable.throw(err);
        })
        .subscribe();
    });
  }

  deleteRegion(regionUrl: URL) : void {
    this._patchReqQueue.next(() =>
    {
      this.http.delete(regionUrl.pathname,
                       ImgRegionEditorService.jsonUtf8ReqOpts())
        .catch((err: Error) => {
          console.log(err);
          return Observable.throw(err);
        })
        .subscribe();
    });
  }

  private updateRotation(imageMeta: IImageMeta) : void
  {
    this.http.patch(imageMeta.href.pathname,
      JSON.stringify({
        rotation : Rotation[imageMeta.rotation],
      }), ImgRegionEditorService.jsonUtf8ReqOpts())
      .subscribe(
        (rsp : Response) =>
          this._imageMeta.next(this.loadImageMeta(imageMeta.imageNode, rsp.json())),
        (err: Error) => console.log(err)
      );
  }

  private loadImageMetaUrl(node: ITreeNode, url: string,
     createIfNone: boolean) : Observable<IImageMeta>
  {
    return this.http.get(url)
      .map((rsp: Response) => this.loadImageMeta(node, rsp.json()))
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
      rotation: Rotation[dict['rotation'] as string]
    }
    return retVal;
  }

  private static jsonUtf8ReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }
}
