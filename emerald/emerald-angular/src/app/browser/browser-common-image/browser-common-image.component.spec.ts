import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserCommonImageComponent } from './browser-common-image.component';

describe('BrowserCommonImageComponent', () => {
  let component: BrowserCommonImageComponent;
  let fixture: ComponentFixture<BrowserCommonImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserCommonImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserCommonImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
