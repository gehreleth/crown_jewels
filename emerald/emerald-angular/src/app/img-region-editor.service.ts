import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './emerald-backend-storage.service'
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';

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

export enum RegionStatus {
  New, UpToDate, Modified,
  MarkedForDeletion, DeletedFromBackend
};

export interface IImageMeta {
  href?: URL;
  regionsHref? : URL;
  imageNode: ITreeNode;
  rotation: Rotation;
}

export interface IImageRegion {
  status: RegionStatus;
  cookie : any;
  href? : URL;
  text? : string;
  x : number;
  y : number;
  width : number;
  height : number;
}

@Injectable()
export class ImgRegionEditorService {
  private readonly _nodeSubj = new Subject<ITreeNode>();
  private readonly _imageUrl = new BehaviorSubject<string>(null);
  private readonly _imageMeta = new BehaviorSubject<IImageMeta>(null);
  private readonly _patchReqQueue = new Subject<() => void>();
  private readonly _regions =
    new BehaviorSubject< Array<IImageRegion> >(new Array<IImageRegion>());

  constructor(private http: Http) {
    this._nodeSubj.subscribe(node => this.onChangeNode(node));
    this._imageMeta.subscribe(im => {
      if (im) {
        this._imageUrl.next(`/emerald/blobs/${im.imageNode.aquamarineId}`
          + `?rot=${Rotation[im.rotation]}`);
        this.loadRegions(im).subscribe(
          (regions : Array<IImageRegion>) => this._regions.next(regions),
          (err: Error) => console.log(err));
      }
    });
    this._patchReqQueue.subscribe(arg => arg());
    this._regions.subscribe(regions => this.synchronizeRegions(regions));
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

  get Regions() : BehaviorSubject< Array<IImageRegion> > {
    return this._regions;
  }

  private synchronizeRegions(regions : Array<IImageRegion>) : void {
    if (regions.length == 0 || !regions.find(r => !r.href || r.status != RegionStatus.UpToDate))
        return;

    let updateQueue = new Array< Observable <IImageRegion> >();
    for (let region of regions) {
      if (!region.href) {
        updateQueue.push(this.createNewRegion(region));
      } else if (region.status !== RegionStatus.UpToDate) {
        if (region.status !== RegionStatus.MarkedForDeletion) {
          updateQueue.push(this.updateRegion(region));
        } else if (region.href) {
          updateQueue.push(this.deleteRegion(region));
        } else {
          updateQueue.push(Observable.throw(["Error - don't know what to do with", region]));
        }
      } else {
        updateQueue.push(Observable.of(region));
      }
    }
    Observable.forkJoin(updateQueue).subscribe(
      (newRegions : Array<IImageRegion>) => {
        newRegions = newRegions
          .filter(q => q.status != RegionStatus.DeletedFromBackend);
        this._regions.next(newRegions)
      },
      (err: Error) => console.log(err)
    );
  }

  private loadRegions(imageMeta: IImageMeta) : Observable< Array<IImageRegion> > {
    return this.http.get(imageMeta.regionsHref.pathname)
    .map((rsp: Response) => {
      let dict = rsp.json();
      return (dict._embedded.imageRegions as any[]).map(r => this.parseRegion(r));
    })
    .catch((err: Error) => {
      console.log(err);
      return Observable.throw(err);
    });
  }

  private parseRegion(arg : any) : IImageRegion {
    const retVal : IImageRegion = {
      status: RegionStatus.UpToDate,
      cookie : null,
      href : new URL(arg._links.self.href),
      text : arg.text,
      x : arg.x,
      y : arg.y,
      width : arg.width,
      height : arg.height
    }
    return retVal;
  }

  private createNewRegion(region: IImageRegion) : Observable<IImageRegion> {
    return this.http.post('/emerald/rest-jpa/img-region',
      JSON.stringify({
        imageMetadata: this._imageMeta.getValue().href,
        x: region.x, y: region.y,
        width: region.width, height: region.height,
      }), ImgRegionEditorService.jsonUtf8ReqOpts())
      .map((rsp: Response) => {
        let dict = rsp.json();
        region = {...region};
        region.status = RegionStatus.UpToDate,
        region.href = new URL(dict._links.self.href);
        return region;
      })
      .catch((err: Error) => {
        console.log(err);
        return Observable.throw(err);
      });
  }

  private updateRegion(region: IImageRegion) : Observable<IImageRegion> {
    return this.http.patch(region.href.pathname,
      JSON.stringify({
        x: region.x, y: region.y,
        width: region.width, height: region.height,
      }), ImgRegionEditorService.jsonUtf8ReqOpts())
      .map((rsp: Response) => {
        let dict = rsp.json();
        region = {...region};
        region.status = RegionStatus.UpToDate,
        region.href = new URL(dict._links.self.href);
        return region;
      })
      .catch((err: Error) => {
        console.log(err);
        return Observable.throw(err);
      })
  }

  private deleteRegion(region: IImageRegion) : Observable<IImageRegion>{
    return this.http.delete(region.href.pathname,
      ImgRegionEditorService.jsonUtf8ReqOpts())
      .map((rsp: Response) => {
        if (rsp.status >= 200 && rsp.status < 300) {
          region = {...region};
          region.status = RegionStatus.DeletedFromBackend;
          return region;
        }
      })
      .catch((err: Error) => {
        console.log(err);
        return Observable.throw(err);
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
      regionsHref : new URL(dict._links.regions.href),
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
