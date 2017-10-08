import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgDimensionProbeComponent } from './img-dimension-probe.component';

describe('ImgDimensionProbeComponent', () => {
  let component: ImgDimensionProbeComponent;
  let fixture: ComponentFixture<ImgDimensionProbeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgDimensionProbeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgDimensionProbeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
