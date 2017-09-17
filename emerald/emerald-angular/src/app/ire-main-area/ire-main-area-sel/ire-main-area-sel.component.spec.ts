import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaSelComponent } from './ire-main-area-sel.component';

describe('IreMainAreaSelComponent', () => {
  let component: IreMainAreaSelComponent;
  let fixture: ComponentFixture<IreMainAreaSelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaSelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaSelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
