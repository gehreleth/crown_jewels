import { Component } from '@angular/core';

@Component({
  selector: 'app-right-pane',
  templateUrl: './right-pane.component.html',
  styleUrls: ['./right-pane.component.css']
})

export class RightPaneComponent {
  pdfSrc: string = '/emerald/storage/img/5cb20fe3-0718-4d56-86ad-4192c05cd5d3';
  page: number = 1;
}
