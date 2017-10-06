import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreBsImageComponent } from './ire-bs-image.component';

describe('IreBsImageComponent', () => {
  let component: IreBsImageComponent;
  let fixture: ComponentFixture<IreBsImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreBsImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreBsImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
