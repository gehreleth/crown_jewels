import { Injectable } from '@angular/core';
import { ITreeNode, NodeType } from './tree-node'
import { Rotation, IImageMeta } from './image-meta'
import { IImageRegion } from './image-region'
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/mergeMap';

class Private {
  static jsonUtf8ReqOpts() : RequestOptions {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    return new RequestOptions({ headers: headers });
  }
}

class ImageMetaImpl implements IImageMeta {
  readonly href: URL;
  readonly regionsHref: URL;
  readonly imageNode: ITreeNode;
  get imageHref() : string {
    return `/emerald/blobs/${this.imageNode.aquamarineId}`
      +`?rot=${Rotation[this.rotation]}`;
  }
  rotation: Rotation;
  regions: Array<ImageRegionImpl>;
  constructor (href: URL, regionsHref: URL,
    imageNode: ITreeNode, rotation: Rotation, regions: Array<ImageRegionImpl>)
  {
    this.href = href;
    this.regionsHref = regionsHref;
    this.imageNode = imageNode;
    this.rotation = rotation;
    this.regions = regions;
  }

  static save(http: Http, node: ITreeNode, imageMeta: ImageMetaImpl)
    : Observable<ImageMetaImpl>
  {
    return http.patch(imageMeta.href.pathname,
       JSON.stringify({
         rotation : Rotation[imageMeta.rotation],
       }), Private.jsonUtf8ReqOpts())
       .map((rsp : Response) => {
         let dict = rsp.json();
         return new ImageMetaImpl(imageMeta.href, imageMeta.regionsHref,
           node, Rotation[dict['rotation'] as string],
           imageMeta.regions);
       })
       .catch((err: Error) => Observable.throw(err))
  }

  static fromNode(http: Http, node: ITreeNode) : Observable<ImageMetaImpl> {
    if (node.type === NodeType.Image) {
      return ImageMetaImpl.loadImageMetaUrl(http, node,
         '/emerald/rest-jpa/image-metadata/search/'
         + `findOneByStorageNodeId?storage_node_id=${node.id}`, true);
    } else {
      return Observable.throw("Only images are supposed to have metadata");
    }
  }

  static createImageMeta(http: Http, node: ITreeNode)
    : Observable<ImageMetaImpl>
  {
    return http.post('/emerald/rest-jpa/image-metadata/',
      JSON.stringify({
        rotation : Rotation[Rotation.NONE],
        storageNode: `/emerald/rest-jpa/storage-node/${node.id}`
      }), Private.jsonUtf8ReqOpts())
      .map((rsp: Response) => {
        const dict = rsp.json();
        const selfHref = new URL(dict._links.self.href);
        const rotation = Rotation[dict['rotation'] as string];
        const regionsHref = new URL(dict._links.regions.href);
        return new ImageMetaImpl(selfHref, regionsHref, node, rotation, []);
      })
  }

  static loadImageMetaUrl(http: Http, node: ITreeNode,
    url: string, createIfNone: boolean) : Observable<ImageMetaImpl>
  {
    return http.get(url)
      .map((rsp: Response) => rsp.json())
      .flatMap(dict => {
        const rotation = Rotation[dict['rotation'] as string];
        const imageMetaHref = new URL(dict._links.self.href);
        const regionsHref = new URL(dict._links.regions.href);
        return ImageMetaImpl.loadRegions(http, regionsHref)
          .map(regions => {
            return new ImageMetaImpl(imageMetaHref, regionsHref, node,
              rotation, regions);
          })
      })
      .catch((err: Error) => {
        return createIfNone
          ? this.createImageMeta(http, node)
          : Observable.throw(err);
      });
  }

  static loadRegions(http: Http, regionsHref: URL)
    : Observable< Array<ImageRegionImpl> >
  {
    return http.get(regionsHref.pathname)
      .map((rsp: Response) => {
        let dict = rsp.json();
        return (dict._embedded.imageRegions as any[])
          .map(r => ImageRegionImpl.fromDict(r));
        })
  }
}

class ImageRegionImpl implements IImageRegion {
  readonly href : URL;
  text : string;
  x : number;
  y : number;
  width : number;
  height : number;

  constructor(href: URL, text: string, x: number, y: number,
    width: number, height: number)
  {
    this.href = href;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static fromDict(dict: any) : ImageRegionImpl {
    return new ImageRegionImpl(new URL(dict._links.self.href),
      dict.text as string, dict.x as number, dict.y as number,
      dict.width as number, dict.height as number);
  }
}

interface IImgRegionEditorAction {
  (arg: ImageMetaImpl): Observable<ImageMetaImpl>;
}

@Injectable()
export class ImgRegionEditorService {
  private readonly _imageMeta = new BehaviorSubject<ImageMetaImpl>(null);
  private readonly _actionQueue = new Subject<IImgRegionEditorAction>();

  constructor(private http: Http) {
    this._actionQueue.subscribe(
      a => a(this._imageMeta.getValue()).subscribe(
        newImgMeta => this._imageMeta.next(newImgMeta),
        err => { console.log(err); }
      ));
  }

  set SelectedImageNode(node: ITreeNode) {
    this._actionQueue.next(() => {
      return ImageMetaImpl.fromNode(this.http, node);
    });
  }

  get SelectedImageNode() : ITreeNode {
    return this._imageMeta.getValue().imageNode;
  }

  get ImageMeta() : Observable<IImageMeta> {
    return this._imageMeta;
  }

  rotateCW() : void {
    this._actionQueue.next(oim => {
      let newImageMeta = new ImageMetaImpl(oim.href,
        oim.regionsHref, oim.imageNode,
        Rotation.rotateCW(oim.rotation), oim.regions);
      return ImageMetaImpl.save(this.http, oim.imageNode, newImageMeta);
    });
  }

  rotateCCW() : void {
    this._actionQueue.next(oim => {
      let newImageMeta = new ImageMetaImpl(oim.href,
        oim.regionsHref, oim.imageNode,
        Rotation.rotateCCW(oim.rotation), oim.regions);
      return ImageMetaImpl.save(this.http, oim.imageNode, newImageMeta);
    });
  }
}


/*    this._imageMeta.subscribe(im => {
      if (im) {
        this._imageUrl.next(`/emerald/blobs/${im.imageNode.aquamarineId}`
          + `?rot=${Rotation[im.rotation]}`);
        this.loadRegions(im).subscribe(
          (regions : Array<IImageRegion>) => this._regions.next(regions),
          (err: Error) => console.log(err));
      }
    });

    private readonly _regions =
      new BehaviorSubject< Array<IImageRegion> >(new Array<IImageRegion>());

    this._regions.subscribe(regions => this.synchronizeRegions(regions));


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

      private readonly _patchReqQueue = new Subject<() => void>();

      this._patchReqQueue.subscribe(arg => arg());
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

      private loadImageMeta(node: ITreeNode, dict: any) : Observable<IImageMeta> {
        const retVal : IImageMeta = {
          href: new URL(dict._links.self.href),
          regionsHref : new URL(dict._links.regions.href),
          imageNode : node,
          rotation: Rotation[dict['rotation'] as string]
        }
        return retVal;
      }

*/
