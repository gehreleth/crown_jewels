import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserCommonComponent } from './browser-common.component';

describe('BrowserCommonComponent', () => {
  let component: BrowserCommonComponent;
  let fixture: ComponentFixture<BrowserCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserCommonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
