import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeView } from './tree-view.component';

describe('TreeViewComponent', () => {
  let component: TreeView;
  let fixture: ComponentFixture<TreeView>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeView ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
