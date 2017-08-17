import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmeraldBackendStorageService, ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
})

export class BrowserComponent implements OnInit {
  id: number | null = null;
  contentUrl: string = null;
  page: number = 1;
  mimeType: string = null;
  contentLength: number = 0;
  nodeIsPdf: boolean = false;
  selectedNode: ITreeNode = null;
  selectedNodeSubj: Subject<ITreeNode> = new Subject<ITreeNode>();
  busy: Promise<any>;

  private isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private storage : EmeraldBackendStorageService,
     private route: ActivatedRoute)
  { }

  ngOnInit() {
    this.selectedNodeSubj.subscribe((node: ITreeNode) => {
      if (node.aquamarineId) {
        this.mimeType = node.mimeType;
        this.contentLength = node.contentLength;
        this.contentUrl = '/emerald/storage/get-content/' + node.aquamarineId;
        this.nodeIsPdf = this.mimeType === 'application/pdf' ? true : false;
      } else {
        this.mimeType = null;
        this.contentLength = 0;
        this.contentUrl = null;
        this.nodeIsPdf = false;
      }
      this.selectedNode = node;
    })

    this.route.params.subscribe(params => {
      let idParam : string = params['id'];
      if (this.isNumberRe.test(idParam)) {
        this.onSelectId(parseInt(idParam));
      }
    });
  }

  afterLoadComplete(pdfDocumentProxy) {
    console.log(pdfDocumentProxy.getMetadata());
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
