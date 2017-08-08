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
  pdfSrc: string = null;
  page: number = 1;

  constructor(private storage : EmeraldBackendStorageService) { }

  ngOnInit() {
    this.storage.activeNode.subscribe((activeNode: ITreeNode) => {
      if (activeNode.aquamarineId != null) {
        this.pdfSrc = '/emerald/storage/get-content/' + activeNode.aquamarineId
      }
    })
  }

  afterLoadComplete(pdfDocumentProxy) {
    console.log(pdfDocumentProxy.getMetadata())
  }
}
