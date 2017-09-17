import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaHandleComponent } from './ire-main-area-handle.component';

describe('IreMainAreaHandleComponent', () => {
  let component: IreMainAreaHandleComponent;
  let fixture: ComponentFixture<IreMainAreaHandleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaHandleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
