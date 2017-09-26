import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'
import { ITreeNode, NodeType } from '../tree-node'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})

export class BrowserComponent implements OnInit {
  private _isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private _activatedRoute: ActivatedRoute,
              private _storageService : EmeraldBackendStorageService)
  { }

  ngOnInit() {
    this._activatedRoute.params.subscribe((params: Params) => {
      const idParam: string = params['id'];
      if (this._isNumberRe.test(idParam)) {
        this._storageService.selectById(parseInt(idParam));
      }
    });
    const selectedNodeChanged = this._storageService.SelectedNodeChanged;
    selectedNodeChanged.subscribe((node: ITreeNode) => this.onRequestNodes(node));
  }

  private onRequestNodes(parent: ITreeNode) {
    this._storageService.populateChildren(parent)
      .then(children => { parent.children = children; });
  }
}
