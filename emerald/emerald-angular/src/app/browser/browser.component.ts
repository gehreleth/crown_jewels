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

  private _routeSubscription: Subscription;
  private _rootNodesSubscription: Subscription;
  private _selectedSubscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _imageMetadataService: ImageMetadataService)
  { }

  ngOnInit() {
    this._routeSubscription = this._activatedRoute.params.subscribe((params: Params) => {
      const idParam: string = params['id'];
      if (this._isNumberRe.test(idParam)) {
        this._browserService.selectById(parseInt(idParam));
      }
    });
    this._rootNodesSubscription =
      this._browserService.rootNodes.subscribe((rootNodes: Array<ITreeNode>) =>
        {
          this._rootNodes = rootNodes;
        });
    this._selectedSubscription =
      this._browserService.selection.subscribe((selection: ITreeNode) => {
        this._selection = selection;
        if (this._selection && this._selection.type === NodeType.Image) {
          let observable = this._imageMetadataService.fromNode(this._selection);
          observable = setBusyIndicator(this._browserService, observable);
          observable.subscribe(imageMeta => {
            this._imageMetadataService.setImageMeta(imageMeta);
          });
        }
      });
  }

  ngOnDestroy() {
    this._rootNodesSubscription.unsubscribe();
    this._selectedSubscription.unsubscribe();
    this._routeSubscription.unsubscribe();
  }
}
