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

  updateShallow(http: Http) : Observable<ImageMetaImpl> {
    return http.patch(this.href.pathname,
       JSON.stringify({
         rotation : Rotation[this.rotation],
       }), Private.jsonUtf8ReqOpts())
       .map((rsp : Response) => {
         const dict = rsp.json();
         return new ImageMetaImpl(this.href, this.regionsHref,
           this.imageNode, Rotation[dict['rotation'] as string],
           this.regions);
       });
  }

  assignRegionsAndUpdateDeep(http: Http, newRegions: Array<IImageRegion>):
    Observable<ImageMetaImpl>
  {
    return http.patch(this.href.pathname,
       JSON.stringify({
         rotation : Rotation[this.rotation],
       }), Private.jsonUtf8ReqOpts())
       .flatMap((rsp : Response) => {
         const dict = rsp.json();
         const putRegionsHref = new URL(dict._links.putRegions.href);
         return http.put(putRegionsHref.pathname,
           ImageMetaImpl.regionsToJson(newRegions))
           .map((rsp : Response) => {
             const dict = rsp.json();
             const regions = (dict._embedded.imageRegions as any[])
               .map(r => ImageRegionImpl.fromDict(r));
             return new ImageMetaImpl(this.href, this.regionsHref,
               this.imageNode, Rotation[dict['rotation'] as string], regions);
           });
       });
  }

  static fromNode(http: Http, node: ITreeNode) : Observable<ImageMetaImpl> {
    if (node.type === NodeType.Image) {
      return ImageMetaImpl.loadImageMeta(http, node,
         '/emerald/rest-jpa/image-metadata/search/'
         + `findOneByStorageNodeId?storage_node_id=${node.id}`, true);
    } else {
      return Observable.throw("Only images are supposed to have metadata");
    }
  }

  private static createImageMeta(http: Http, node: ITreeNode)
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
      });
  }

  private static loadImageMeta(http: Http, node: ITreeNode,
    url: string, createIfNone: boolean) : Observable<ImageMetaImpl>
  {
    return http.get(url)
      .map((rsp: Response) => rsp.json())
      .flatMap(dict => {
        const rotation = Rotation[dict['rotation'] as string];
        const imageMetaHref = new URL(dict._links.self.href);
        const regionsHref = new URL(dict._links.regions.href);
        const putRegionsHref = new URL(dict._links.putRegions.href);
        return ImageMetaImpl.loadRegions(http, regionsHref)
          .map(regions => {
            return new ImageMetaImpl(imageMetaHref, regionsHref, node,
                rotation, regions);
          });
      })
      .catch((err: Error) => {
        return createIfNone
          ? this.createImageMeta(http, node)
          : Observable.throw(err);
      });
  }

  private static loadRegions(http: Http, regionsHref: URL)
    : Observable< Array<ImageRegionImpl> >
  {
    return http.get(regionsHref.pathname)
      .map((rsp: Response) => {
        const dict = rsp.json();
        return (dict._embedded.imageRegions as any[])
          .map(r => ImageRegionImpl.fromDict(r));
      });
  }

  private static regionsToJson(regions: Array<IImageRegion>): string {
    return JSON.stringify({
        _embedded: {
          imageRegions: regions.map(r => {
            return {
              text: r.text, x: r.x, y: r.y, width: r.width, height: r.height
            }
          })
        }
      });
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
      let newImageMeta = new ImageMetaImpl(oim.href, oim.regionsHref,
        oim.imageNode, Rotation.rotateCW(oim.rotation), oim.regions);
      return newImageMeta.updateShallow(this.http);
    });
  }

  rotateCCW() : void {
    this._actionQueue.next(oim => {
      let newImageMeta = new ImageMetaImpl(oim.href, oim.regionsHref,
        oim.imageNode, Rotation.rotateCCW(oim.rotation), oim.regions);
      return newImageMeta.updateShallow(this.http);
    });
  }

  saveRegions(regions: Array<IImageRegion>) : void {
    this._actionQueue.next(oim => {
      let newImageMeta = new ImageMetaImpl(oim.href,
        oim.regionsHref, oim.imageNode, oim.rotation, []);
      return newImageMeta.assignRegionsAndUpdateDeep(this.http, regions);
    });
  }
}
