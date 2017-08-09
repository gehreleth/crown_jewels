import { Component, OnInit } from '@angular/core';
import { EmeraldBackendStorageService,
         ITreeNode,
         NodeType } from '../emerald-backend-storage.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
})
export class BrowserComponent implements OnInit {
  title = 'Emerald';
  contentUrl: string = null;
  page: number = 1;
  mimeType: string = null;
  contentLength: number = 0;
  nodeIsPdf: boolean = false;

  constructor(private storage : EmeraldBackendStorageService,
    private router : Router)
  { }

  ngOnInit() {
    this.storage.onNewRoots.subscribe(() => this.refresh())
    this.storage.onNewRoots.emit()

    this.storage.activeNode.subscribe((activeNode: ITreeNode) => {
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
    })
  }

  afterLoadComplete(pdfDocumentProxy) {
    console.log(pdfDocumentProxy.getMetadata())
  }

  Nodes: Array<ITreeNode> = [];
  selectedNode: ITreeNode = null;

  private refresh() {
    let lookup = new Set<number>(this.Nodes.map((node) => node.id));
    this.storage.populateChildren(null)
      .then((roots: Array<ITreeNode>) =>
        roots.filter(r => {
                  console.log(r)
                  return !lookup.has(r.id)
                }))
      .then((newNodes) => {
        console.log(newNodes)
        this.Nodes = this.Nodes.concat(newNodes)
      });
  }

  onSelectNode(node: ITreeNode) {
    this.selectedNode = node;
    this.storage.activeNode.next(node);
  }

  onRequest(parent: ITreeNode) {
    this.storage.populateChildren(parent).then(
      (children : Array<ITreeNode>) => { parent.children = children;});
  }
}
