import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmeraldBackendStorageService, ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})

export class BrowserComponent implements OnInit {
  public nodeType = NodeType;
  id: number | null = null;
  contentLength: number = 0;
  selectedNode: ITreeNode = null;
  selectedNodeSubj: Subject<ITreeNode> = new Subject<ITreeNode>();
  busy: Promise<any>;

  private isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private storage : EmeraldBackendStorageService,
     private route: ActivatedRoute)
  { }

  ngOnInit() {
    this.selectedNodeSubj.subscribe((node: ITreeNode) => {
      this.selectedNode = node;
    })

    this.route.params.subscribe(params => {
      let idParam : string = params['id'];
      if (this.isNumberRe.test(idParam)) {
        this.onSelectId(parseInt(idParam));
      }
    });
  }

  onSelectId(id: number) {
    let pr = this.storage.getNodeById(id);
    this.busy = pr;
    pr.then(node => {
      let cur = node;
      while (cur) {
        cur.isExpanded = true;
        cur = cur.parent;
      }
      this.onSelectNode(node);
    })
  }

  onSelectNode(node: ITreeNode) {
    this.selectedNodeSubj.next(node);
  }

  onRequest(parent: ITreeNode) {
    let pr = this.storage.populateChildren(parent);
    this.busy = pr;
    pr.then(children => { parent.children = children; });
  }
}
