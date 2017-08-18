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
