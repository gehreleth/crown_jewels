import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserSelectionsComponent } from './browser-selections.component';

describe('BrowserSelectionsComponent', () => {
  let component: BrowserSelectionsComponent;
  let fixture: ComponentFixture<BrowserSelectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserSelectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserSelectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
