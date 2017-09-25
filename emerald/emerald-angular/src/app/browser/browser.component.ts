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
  private busy: Promise<any>;

  constructor(private _storageService : EmeraldBackendStorageService)
  { }

  ngOnInit() {
  }

  onRequest(parent: ITreeNode) {
    let pr = this._storageService.populateChildren(parent);
    this.busy = pr;
    pr.then(children => { parent.children = children; });
  }
}
