import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaDeleteComponent } from './ire-main-area-delete.component';

describe('IreMainAreaDeleteComponent', () => {
  let component: IreMainAreaDeleteComponent;
  let fixture: ComponentFixture<IreMainAreaDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
