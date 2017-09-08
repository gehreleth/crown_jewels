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
import { RouterModule, Routes } from '@angular/router';
import { BrowserComponent } from './browser/browser.component';
import { MenuComponent } from './menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BusyModule } from 'angular2-busy';
import { ImgRegionEditorComponent } from './img-region-editor/img-region-editor.component';
import { ImageMetadataService } from './image-metadata.service';
import { IreMainAreaComponent } from './ire-main-area/ire-main-area.component';
import { IreMainAreaSelComponent } from './ire-main-area-sel/ire-main-area-sel.component';
import { IreMainAreaHandleComponent } from './ire-main-area-handle/ire-main-area-handle.component';

const routes: Routes = [
    { path: '', redirectTo: 'browse/-', pathMatch: 'full' },
    { path: 'browse/:id', component: BrowserComponent }
];
@NgModule({
  declarations: [
    AppComponent,
    UploadFormComponent,
    TreeView,
    BrowserComponent,
    MenuComponent,
    ImgRegionEditorComponent,
    IreMainAreaComponent,
    IreMainAreaSelComponent,
    IreMainAreaHandleComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    HttpModule,
    BrowserAnimationsModule,
    BusyModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ EmeraldBackendStorageService,
               ImageMetadataService,
             { provide: LocationStrategy, useClass: HashLocationStrategy },
             { provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
