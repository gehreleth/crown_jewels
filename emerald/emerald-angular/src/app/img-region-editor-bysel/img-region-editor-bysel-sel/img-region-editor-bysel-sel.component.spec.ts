import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgRegionEditorByselSelComponent } from './img-region-editor-bysel-sel.component';

describe('ImgRegionEditorByselSelComponent', () => {
  let component: ImgRegionEditorByselSelComponent;
  let fixture: ComponentFixture<ImgRegionEditorByselSelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgRegionEditorByselSelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgRegionEditorByselSelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
