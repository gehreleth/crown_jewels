import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import "rxjs/add/operator/filter";

import { ReplaySubject } from 'rxjs/ReplaySubject';

import { ITreeNode } from '../backend/entities/tree-node';
import { IImageRegion } from '../backend/entities/image-region';
import { IEnumerated } from '../util/enumerated';

export interface IEditorRegion extends IEnumerated, IImageRegion {
};

export interface IEditorRegions {
  readonly [ index: number ]: IEditorRegion;
}

@Injectable()
export class RegionEditorService {
  constructor() { }

  private readonly _state$ = new ReplaySubject<RegionEditorServiceState>(1);

  reinit(regions: Array<IImageRegion>) {
    let href2Region = new Map<string, number>();
    for (let i = 0; i < regions.length; i++) {
      href2Region.set(regions[i].href, i);
    }
    return this._state$.next({ regions: regions, href2ix: href2Region });
  }

  get regions(): Observable<Array<IEditorRegion>> {
    return this._state$.map(s => state2EditorRegions(s));
  }

  updateRegion(region: IImageRegion) {
    this._state$.first().subscribe(s => {
      const newState = stateUpdateRegion(s, region);
      this._state$.next(newState);
    });
  }
}

interface RegionEditorServiceState {
  regions: Array<IImageRegion>,
  href2ix: Map<string, number>
}

function state2EditorRegions(state: RegionEditorServiceState): IEditorRegions {
  const arr = state.regions.map(r => {
    const num0 = state.href2ix.get(r.href);
    const retVal: IEditorRegion = {
      num: state.href2ix.get(r.href),
      ...r
    };
    return retVal;
  });
  return arr;
}

function stateUpdateRegion(state: RegionEditorServiceState, region: IImageRegion) {
  let arr = state.regions;
  const ix = state.href2ix.get(region.href);
  arr[ix] = region;
  let newState = { ...state };
  newState.regions = arr;
  return newState;
}
