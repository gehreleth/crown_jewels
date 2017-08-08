import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http'
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AppComponent } from './app.component';
import { LeftPaneComponent } from './left-pane/left-pane.component';
import { UploadFormComponent } from './upload-form/upload-form.component';
import { EmeraldBackendStorageService } from './emerald-backend-storage.service';
import { TreeView } from './tree-view/tree-view.component'
import { PdfViewerComponent } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    AppComponent,
    PdfViewerComponent,
    LeftPaneComponent,
    UploadFormComponent,
    TreeView,
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    HttpModule
  ],
  providers: [ EmeraldBackendStorageService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
