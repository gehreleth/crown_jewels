import { BrowserModule } from '@angular/platform-browser';
import { NgxPopperModule } from 'ngx-popper';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http'
import { LocationStrategy,
         HashLocationStrategy,
         APP_BASE_HREF } from '@angular/common';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { AppComponent } from './app.component';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BusyModule } from 'angular2-busy';
import { ImgRegionEditorComponent } from './img-region-editor/img-region-editor.component';
import { IreMainAreaComponent } from './ire-main-area/ire-main-area.component';
import { IreMainAreaSelComponent } from './ire-main-area/ire-main-area-sel/ire-main-area-sel.component';
import { IreMainAreaHandleComponent } from './ire-main-area/ire-main-area-handle/ire-main-area-handle.component';
import { IreMainAreaActionLayerComponent } from './ire-main-area/ire-main-area-action-layer/ire-main-area-action-layer.component';
import { IreMainAreaHandlersComponent } from './ire-main-area/ire-main-area-handlers/ire-main-area-handlers.component';
import { IreMainAreaDeleteComponent } from './ire-main-area/ire-main-area-delete/ire-main-area-delete.component';
import { ImgRegionEditorByselComponent } from './img-region-editor-bysel/img-region-editor-bysel.component';
import { ImgRegionEditorByselSelComponent } from './img-region-editor-bysel/img-region-editor-bysel-sel/img-region-editor-bysel-sel.component';
import { IreBsImageComponent } from './img-region-editor-bysel/ire-bs-image/ire-bs-image.component';
import { BrowserCommonImageComponent } from './browser/browser-common-image/browser-common-image.component';
import { PaginatorComponent } from './paginator/paginator.component';

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
    ImgRegionEditorByselSelComponent,
    IreBsImageComponent,
    BrowserCommonImageComponent,
    PaginatorComponent
  ],
  imports: [
    BrowserModule,
    NgxPopperModule,
    AngularFontAwesomeModule,
    HttpModule,
    BrowserAnimationsModule,
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
