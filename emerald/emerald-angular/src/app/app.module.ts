import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http'
import { LocationStrategy,
         HashLocationStrategy,
         APP_BASE_HREF } from '@angular/common';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { AppComponent } from './app.component';
import { UploadFormComponent } from './upload-form/upload-form.component';
import { EmeraldBackendStorageService } from './emerald-backend-storage.service';
import { TreeView } from './tree-view/tree-view.component'
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { RouterModule, Routes } from '@angular/router';
import { BrowserComponent } from './browser/browser.component';

const routes: Routes = [
    { path: '', redirectTo: 'browse', pathMatch: 'full' },
    { path: 'browse', component: BrowserComponent }
];
@NgModule({
  declarations: [
    AppComponent,
    PdfViewerComponent,
    UploadFormComponent,
    TreeView,
    BrowserComponent,
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ EmeraldBackendStorageService,
             { provide: LocationStrategy, useClass: HashLocationStrategy },
             { provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
