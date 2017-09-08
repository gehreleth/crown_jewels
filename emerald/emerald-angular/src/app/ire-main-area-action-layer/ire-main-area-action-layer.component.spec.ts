import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IreMainAreaActionLayerComponent } from './ire-main-area-action-layer.component';

describe('IreMainAreaActionLayerComponent', () => {
  let component: IreMainAreaActionLayerComponent;
  let fixture: ComponentFixture<IreMainAreaActionLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IreMainAreaActionLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IreMainAreaActionLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
