import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserOverviewComponent } from './browser-overview.component';

describe('BrowserOverviewComponent', () => {
  let component: BrowserOverviewComponent;
  let fixture: ComponentFixture<BrowserOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
