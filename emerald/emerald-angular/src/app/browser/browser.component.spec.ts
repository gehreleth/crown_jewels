import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserComponent } from './browser.component';
import { EmeraldBackendStorageService, ITreeNode, NodeType } from '../emerald-backend-storage.service'
import { MockComponent } from 'ng2-mock-component'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ActivatedRoute } from '@angular/router';

class StorageStub {
  Nodes : Array<ITreeNode> = []
  getNodeById = jasmine.createSpy('getNodeById')
  populateChildren = jasmine.createSpy('populateChildren')
  upload  = jasmine.createSpy('upload')
}

class ActivatedRouteStub {
  private subject = new BehaviorSubject({id: 1});
  params = this.subject.asObservable();
}
/*
describe('BrowserComponent', () => {
  let component: BrowserComponent;
  let fixture: ComponentFixture<BrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowserComponent,
        MockComponent({
          selector: 'tree-view',
          inputs: ['Nodes', 'SelectedNode'],
          outputs: ['onRequestNodes']
        }),
        MockComponent({
          selector: 'pdf-viewer',
          inputs: ['src', 'page', 'original-size'],
        }),
        MockComponent({
          selector: 'app-upload-form'
        })
      ],
      providers: [
        { provide: EmeraldBackendStorageService, useClass: StorageStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
*/
