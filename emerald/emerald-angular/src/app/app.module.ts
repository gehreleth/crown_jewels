import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'
import { LocationStrategy,
         HashLocationStrategy,
         APP_BASE_HREF } from '@angular/common';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { AppComponent } from './app.component';
import { NgxPopperModule } from 'ngx-popper';
import { TagInputModule } from 'ngx-chips';
import { BusyModule } from 'angular2-busy';
import { UploadFormComponent } from './upload-form/upload-form.component';
import { BrowserService } from './services/browser.service';
import { HttpSettingsService } from './services/http-settings.service';
import { TreeView } from './tree-view/tree-view.component'
import { RouterModule, Routes } from '@angular/router';
import { BrowserComponent } from './browser/browser.component';
import { BrowserCommonComponent } from './browser/browser-common/browser-common.component';
import { BrowserOverviewComponent } from './browser/browser-overview/browser-overview.component';
import { BrowserSelectionsComponent } from './browser/browser-selections/browser-selections.component';
import { MenuComponent } from './menu/menu.component';
import { ImgRegionEditorComponent } from './img-region-editor/img-region-editor.component';
import { IreMainAreaComponent } from './ire-main-area/ire-main-area.component';
import { IreMainAreaSelComponent } from './ire-main-area/ire-main-area-sel/ire-main-area-sel.component';
import { IreMainAreaHandleComponent } from './ire-main-area/ire-main-area-handle/ire-main-area-handle.component';
import { IreMainAreaActionLayerComponent } from './ire-main-area/ire-main-area-action-layer/ire-main-area-action-layer.component';
import { IreMainAreaHandlersComponent } from './ire-main-area/ire-main-area-handlers/ire-main-area-handlers.component';
import { IreMainAreaDeleteComponent } from './ire-main-area/ire-main-area-delete/ire-main-area-delete.component';
import { ImgRegionEditorByselComponent } from './img-region-editor-bysel/img-region-editor-bysel.component';
import { IreBsImageComponent } from './img-region-editor-bysel/ire-bs-image/ire-bs-image.component';
import { BrowserCommonImageComponent } from './browser/browser-common-image/browser-common-image.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { ImgRegionEditorByselPreviewComponent } from './img-region-editor-bysel/img-region-editor-bysel-preview/img-region-editor-bysel-preview.component';
import { ImgRegionEditorByselAlterComponent } from './img-region-editor-bysel/img-region-editor-bysel-alter/img-region-editor-bysel-alter.component';

const routes: Routes = [
    { path: '', redirectTo: 'browse/-', pathMatch: 'full' },
    { path: 'browse/:id',
      component: BrowserComponent,
      children: [
        {path: '', component: BrowserOverviewComponent },
        {path: 'selections', component: BrowserSelectionsComponent },
      ]
  }
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
    IreMainAreaHandleComponent,
    IreMainAreaActionLayerComponent,
    IreMainAreaHandlersComponent,
    IreMainAreaDeleteComponent,
    BrowserOverviewComponent,
    BrowserSelectionsComponent,
    BrowserCommonComponent,
    ImgRegionEditorByselComponent,
    IreBsImageComponent,
    BrowserCommonImageComponent,
    PaginatorComponent,
    ImgRegionEditorByselPreviewComponent,
    ImgRegionEditorByselAlterComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    NgxPopperModule,
    AngularFontAwesomeModule,
    HttpModule,
    BrowserAnimationsModule,
    TagInputModule,
    BusyModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ BrowserService,
               HttpSettingsService,
             { provide: LocationStrategy, useClass: HashLocationStrategy },
             { provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
