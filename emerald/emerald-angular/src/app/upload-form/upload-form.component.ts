import { Component,
         ElementRef,
         ViewChild,
         OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit {
  constructor(private storage: EmeraldBackendStorageService, private el: ElementRef) { }
  @ViewChild("fileInput") fileInput: ElementRef;

  ngOnInit() {}

  onUpload() {
    let files = this.fileInput.nativeElement['files'] as FileList;
    if (files.length == 1) {
      this.storage.upload(files[0])
    }
  }
}
