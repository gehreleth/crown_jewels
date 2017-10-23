import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserService } from '../services/browser.service'
import { ImageMetadataService } from '../services/image-metadata.service'

import { ITreeNode, NodeType } from '../backend/entities/tree-node';
import { Subscription } from 'rxjs/Subscription';

import setBusyIndicator from '../util/setBusyIndicator';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss'],
  providers: [ ImageMetadataService ]
})
export class BrowserComponent implements OnInit, OnDestroy {
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _rootNodes: Array<ITreeNode>;
  private _selection: ITreeNode;

  private _routeSub: Subscription;
  private _rootNodesSub: Subscription;
  private _selectedSub: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._routeSub = this._activatedRoute.params.subscribe((params: Params) => {
      const idParam: string = params['id'];
      if (this._isNumberRe.test(idParam)) {
        this._browserService.selectById(parseInt(idParam));
      }
    });

    this._rootNodesSub = this._browserService.rootNodes.subscribe((rootNodes: Array<ITreeNode>) => {
      this._rootNodes = rootNodes;
    });

    this._selectedSub = this._browserService.selection.subscribe((selection: ITreeNode) => {
      this._selection = selection;
      this._imageMetadataService.reset(this._selection);
    });
  }

  ngOnDestroy() {
    this._rootNodesSub.unsubscribe();
    this._selectedSub.unsubscribe();
    this._routeSub.unsubscribe();
  }
}
