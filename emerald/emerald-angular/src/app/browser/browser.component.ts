import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BrowserService } from '../services/browser.service'
import { ITreeNode } from '../backend/entities/tree-node';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss'],
})
export class BrowserComponent implements OnInit, OnDestroy {
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  private _rootNodes: Array<ITreeNode>;
  private _selection: ITreeNode;

  private _routeSubscription: Subscription;
  private _rootNodesSubscription: Subscription;
  private _selectedSubscription: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService)
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
      });
  }

  ngOnDestroy() {
    this._rootNodesSubscription.unsubscribe();
    this._selectedSubscription.unsubscribe();
    this._routeSubscription.unsubscribe();
  }
}
