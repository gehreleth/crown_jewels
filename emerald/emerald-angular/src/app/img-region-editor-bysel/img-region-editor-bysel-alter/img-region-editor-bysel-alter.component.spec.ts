import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgRegionEditorByselAlterComponent } from './img-region-editor-bysel-alter.component';

describe('ImgRegionEditorByselAlterComponent', () => {
  let component: ImgRegionEditorByselAlterComponent;
  let fixture: ComponentFixture<ImgRegionEditorByselAlterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgRegionEditorByselAlterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgRegionEditorByselAlterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
