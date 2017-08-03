import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http'
import { TreeTableModule } from "ng-treetable";
import { FileUpload } from "ng-file-upload";

import { AppComponent } from './app.component';
import { LeftPaneComponent } from './left-pane/left-pane.component';
import { RightPaneComponent } from './right-pane/right-pane.component';
import { UploadFormComponent } from './upload-form/upload-form.component';
import { EmeraldBackendStorageService } from './emerald-backend-storage.service'

@NgModule({
  declarations: [
    AppComponent,
    LeftPaneComponent,
    RightPaneComponent,
    UploadFormComponent
  ],
  imports: [
    BrowserModule,
    TreeTableModule,
    HttpModule
  ],
  providers: [ EmeraldBackendStorageService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
