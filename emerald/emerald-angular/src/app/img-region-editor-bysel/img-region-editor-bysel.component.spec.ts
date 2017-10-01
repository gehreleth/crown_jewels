import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgRegionEditorByselComponent } from './img-region-editor-bysel.component';

describe('ImgRegionEditorByselComponent', () => {
  let component: ImgRegionEditorByselComponent;
  let fixture: ComponentFixture<ImgRegionEditorByselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgRegionEditorByselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgRegionEditorByselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
