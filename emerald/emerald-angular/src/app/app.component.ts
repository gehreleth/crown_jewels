import { Component, OnInit } from '@angular/core';
import { EmeraldBackendStorageService,
   ITreeNode, NodeType } from './emerald-backend-storage.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Emerald';
  contentUrl: string = null;
  page: number = 1;
  mimeType: string = null;
  contentLength: number = 0;
  nodeIsPdf: boolean = false;

  constructor(private storage : EmeraldBackendStorageService) { }

  ngOnInit() {
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
}
