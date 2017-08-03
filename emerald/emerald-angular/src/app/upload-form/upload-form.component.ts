import { Component, ViewChild, OnInit } from '@angular/core';
import { EmeraldBackendStorageService } from '../emerald-backend-storage.service'

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})

export class UploadFormComponent implements OnInit {
  @ViewChild("fileInput") fileInput;

  constructor(private storage : EmeraldBackendStorageService) { }

  ngOnInit() {}

  addFile(): void {
      let fi = this.fileInput.nativeElement;
      if (fi.files && fi.files[0]) {
          let fileToUpload = fi.files[0];
          this.storage.submit(fileToUpload)
            /* .then(res => {
                console.log(res)
              }); */
      }
  }
}
