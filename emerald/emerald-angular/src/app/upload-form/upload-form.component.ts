import { Component,
         ElementRef,
         ViewChild,
         OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BrowserService } from '../services/browser.service'

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit {
  constructor(private _storage: BrowserService) { }
  @ViewChild("fileInput") fileInput: ElementRef;

  ngOnInit() {}

  onUpload() {
    let files = this.fileInput.nativeElement['files'] as FileList;
    if (files.length == 1) {
      this._storage.upload(files[0]);
    }
  }
}
