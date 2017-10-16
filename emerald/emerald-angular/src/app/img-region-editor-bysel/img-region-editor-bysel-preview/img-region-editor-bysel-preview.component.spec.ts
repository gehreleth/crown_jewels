import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgRegionEditorByselPreviewComponent } from './img-region-editor-bysel-preview.component';

describe('ImgRegionEditorByselPreviewComponent', () => {
  let component: ImgRegionEditorByselPreviewComponent;
  let fixture: ComponentFixture<ImgRegionEditorByselPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgRegionEditorByselPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgRegionEditorByselPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
