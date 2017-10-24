import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { HttpSettingsService } from '../services/http-settings.service';

import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { IImageMeta } from '../backend/entities/image-meta';
import { IImageRegion } from '../backend/entities/image-region';
import { ITaggedImageRegion } from '../backend/entities/tagged-image-region';

import { IQuery } from '../backend/query';
import { IEnumerated } from '../util/enumerated';

import getBlobUrl from '../util/getBlobUrl';
import metaFromNode from '../backend/metaFromNode';
import rotateCW from '../backend/rotateCW';
import rotateCCW from '../backend/rotateCCW';

import allRegions from '../backend/allRegions';
import updateRegions from '../backend/updateRegions';
import updateSingleRegion from '../backend/updateSingleRegion';
import extendRegionsWithTags from '../backend/extendRegionsWithTags';

import { IBusyIndicatorHolder } from '../util/busy-indicator-holder';
import setBusyIndicator from '../util/setBusyIndicator';

export interface IEnumeratedTaggedRegion extends IEnumerated, ITaggedImageRegion {
}

@Injectable()
export class ImageMetadataService implements IBusyIndicatorHolder {
  /**
   * Backend call queue. It's supposed to be bound to a busy GUI indicator.
   * User shouldn't alter this value directry.
   */
  busyIndicator: Promise<any> = Promise.resolve(1);

  private readonly _state$ = new ReplaySubject<IImageMetadataServiceState>(1);

  constructor(private _http: Http, private _httpSettings: HttpSettingsService)
  { }

  reset(node: ITreeNode, onCompleteHook?: () => void) {
    let obs = ((node && node.type === NodeType.Image)
        ? metaFromNode(this._http, this._httpSettings.DefReqOpts, node)
        : Observable.of(null))
      .concatMap(im => {
        if (im) {
          let scope = this.makeAllRegionsScope(im);
          return scope().concatMap(r => extendRegionsWithTags(this._http, r)
            .map(regions => {
              let arr: Array<IEnumeratedTaggedRegion> = [];
              let lookup = new Map<string, number>();
              for (let i = 0; i < regions.length; ++i) {
                const r = regions[i];
                arr.push({ ...r, num: i });
                lookup.set(r.href, i);
              }
              return { imageMeta: im, scope: scope, regions: arr, href2num: lookup };
            }));
        } else {
          return Observable.of({});
        }
      })
    setBusyIndicator(this, obs, onCompleteHook).subscribe(s => this.next(s));
  }

  rotateCW(onCompleteHook?: () => void) {
    let obs = this._state$.first().concatMap(s =>
      rotateCW(this._http, this._httpSettings.DefReqOpts, s.imageMeta).map(im => {
        return {...s, imageMeta: im }
      }));

    setBusyIndicator(this, obs, onCompleteHook).subscribe(s => this.next(s));
  }

  rotateCCW(onCompleteHook?: () => void) {
    let obs = this._state$.first().concatMap(s =>
      rotateCCW(this._http, this._httpSettings.DefReqOpts, s.imageMeta).map(im => {
        return {...s, imageMeta: im }
      }));

    setBusyIndicator(this, obs, onCompleteHook).subscribe(s => this.next(s));
  }

  get imageHref$(): Observable<string> {
    return this._state$.filter(s => !!s.imageMeta)
      .map(s => getBlobUrl(s.imageMeta))
      .distinctUntilChanged();
  }

  get imageMeta$(): Observable<IImageMeta> {
    return this._state$.filter(s => !!s.imageMeta).map(s => s.imageMeta);
  }

  get regions$(): Observable<Array<IEnumeratedTaggedRegion>> {
    return this._state$.filter(s => !!s.imageMeta).map(s => s.regions);
  }

  makeAllRegionsScope(imageMeta: IImageMeta): IQuery<Array<IImageRegion>> {
    return () => allRegions(this._http, imageMeta);
  }

  updateRegionsShallow(regions: Array<IImageRegion>, onCompleteHook?: () => void) {
    let obs = this._state$.first().concatMap(s =>
      updateRegions(this._http, this._httpSettings.DefReqOpts,
        s.imageMeta, s.scope, regions).map(regions => {
          let arr = [ ...s.regions ];
          let lookup = { ...s.href2num };
          for (let r of regions) {
           if (lookup.has(r.href)) {
             const ix = lookup.get(r.href);
             arr[ix] = { ...arr[ix], r };
           } else {
             const ix = arr.length;
             arr.push({...r, num: ix, tags:[]});
             lookup.set(r.href, ix);
           }
          }
          return { ...s, regions: arr, href2num: lookup };
        }));

    setBusyIndicator(this, obs, onCompleteHook).subscribe(s => this.next(s));
  }

  updateRegionDeep(region: ITaggedImageRegion, onCompleteHook?: () => void) {
    let obs = this._state$.first().concatMap(s =>
      updateSingleRegion(this._http, this._httpSettings.DefReqOpts, region)
        .map(r => {
          const lookup = s.href2num;
          let arr = [ ...s.regions ];
          if (lookup.has(r.href)) {
            const ix = lookup.get(r.href);

            arr[ix] = { ...r, num: ix };
          }
          return { ...s, regions: arr };
        }));

    setBusyIndicator(this, obs, onCompleteHook).subscribe(s => this.next(s));
  }

  private next(arg: IImageMetadataServiceState) {
    this._state$.next(arg);
  }
}

interface IImageMetadataServiceState {
  readonly imageMeta?: IImageMeta,
  readonly scope?: IQuery<Array<IImageRegion>>,
  readonly regions?: Array<IEnumeratedTaggedRegion>,
  readonly href2num?: Map<string, number>
}
