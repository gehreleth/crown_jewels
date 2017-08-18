import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgRegionEditorComponent } from './img-region-editor.component';

describe('ImgRegionEditorComponent', () => {
  let component: ImgRegionEditorComponent;
  let fixture: ComponentFixture<ImgRegionEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgRegionEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgRegionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
