import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaComponent } from './ire-main-area.component';

describe('IreMainAreaComponent', () => {
  let component: IreMainAreaComponent;
  let fixture: ComponentFixture<IreMainAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
