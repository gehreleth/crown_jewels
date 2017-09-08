import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaHandlersComponent } from './ire-main-area-handlers.component';

describe('IreMainAreaHandlersComponent', () => {
  let component: IreMainAreaHandlersComponent;
  let fixture: ComponentFixture<IreMainAreaHandlersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaHandlersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaHandlersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
