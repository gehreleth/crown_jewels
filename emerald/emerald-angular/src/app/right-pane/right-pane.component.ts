import { Component, OnInit  } from '@angular/core';
import { EmeraldBackendStorageService,
   ITreeNode, NodeType } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-right-pane',
  templateUrl: './right-pane.component.html',
  styleUrls: ['./right-pane.component.css']
})

export class RightPaneComponent implements OnInit {
  pdfSrc: string = null;
  page: number = 1;
  constructor(private storage : EmeraldBackendStorageService) {}

  ngOnInit() {
    this.storage.activeNode.subscribe((activeNode: ITreeNode) => {
      if (activeNode.aquamarineId != null) {
        this.pdfSrc = '/emerald/storage/img/' + activeNode.aquamarineId
      }
    })
	}
}
