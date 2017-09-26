import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'
import { ITreeNode, NodeType } from '../tree-node'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})

export class BrowserComponent implements OnInit {
  public nodeType = NodeType;


  constructor(private _storageService : EmeraldBackendStorageService)
  { }

  ngOnInit() {
    const selectedNodeChanged = this._storageService.SelectedNodeChanged;
    selectedNodeChanged.subscribe((node: ITreeNode) => this.onRequest(node));
  }

  onRequest(parent: ITreeNode) {
    this._storageService.populateChildren(parent)
      .then(children => { parent.children = children; });
  }
}
