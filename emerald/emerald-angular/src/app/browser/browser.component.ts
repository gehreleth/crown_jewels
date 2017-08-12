import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmeraldBackendStorageService, ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
})

export class BrowserComponent implements OnInit {
  id: number | null = null;
  title: string = 'Emerald';
  contentUrl: string = null;
  page: number = 1;
  mimeType: string = null;
  contentLength: number = 0;
  nodeIsPdf: boolean = false;
  selectedNode: ITreeNode = null;
  selectedNodeSubj: Subject<ITreeNode> = new Subject<ITreeNode>();

  private isNumberRe: RegExp = new RegExp("^\\d+$");

  constructor(private storage : EmeraldBackendStorageService,
    private router : Router, private route: ActivatedRoute)
  { }

  ngOnInit() {
    this.selectedNodeSubj.subscribe((activeNode: ITreeNode) => {
      if (activeNode.aquamarineId != null) {
        this.mimeType = activeNode.mimeType;
        this.contentLength = activeNode.contentLength;
        this.contentUrl = '/emerald/storage/get-content/' + activeNode.aquamarineId;
        this.nodeIsPdf = this.mimeType === 'application/pdf' ? true : false;
      } else {
        this.mimeType = null;
        this.contentLength = 0;
        this.contentUrl = null;
        this.nodeIsPdf = false;
      }
      this.selectedNode = activeNode;
    })

    this.route.params.subscribe(params => {
      let idParam : string = params['id'];
      if (this.isNumberRe.test(idParam)) {
        this.onSelectId(parseInt(idParam));
      }
    });
  }

  afterLoadComplete(pdfDocumentProxy) {
    console.log(pdfDocumentProxy.getMetadata())
  }

  onSelectId(id: number) {
    this.storage.getNodeById(id).then(node => {
      let cur = node
      while (cur != null) {
        cur.isExpanded = true
        cur = cur.parent
      }
      this.onSelectNode(node)
    })
  }

  private expandBranch(path : Array<number>) {

  }

  onSelectNode(node: ITreeNode) {
    this.selectedNodeSubj.next(node);
  }

  onRequest(parent: ITreeNode) {
    this.storage.populateChildren(parent).then(
      (children : Array<ITreeNode>) => {
        parent.children = children
      });
  }
}
