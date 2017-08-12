import { TestBed, inject } from '@angular/core/testing';
import {Injectable, ReflectiveInjector} from '@angular/core';
import { EmeraldBackendStorageService, ITreeNode, NodeType } from './emerald-backend-storage.service';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Http,
  RequestOptions,
  HttpModule,
  XHRBackend,
  ResponseOptions,
  Response,
  RequestMethod
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

describe('MockBackend EmeraldBackendStorageService populateChildren', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http, EmeraldBackendStorageService ]);
    this.backendStorageService = this.injector.get(EmeraldBackendStorageService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  it('populateChildren(null) should query current service url', () => {
    this.backendStorageService.populateChildren(null);
    expect(this.lastConnection).toBeDefined('no http service connection at all?');
    expect(this.lastConnection.request.url).toEqual("/emerald/storage/populate-root", 'url invalid');
  });

  it('populateChildren(non-null) should query current service url', () => {
    let parent = ITreeNode.fromDict(
      JSON.parse(`  {
          "id": 20,
          "type": "Zip",
          "text": "coll.zip",
          "children": null,
          "aquamarineId": null,
          "contentLength": null,
          "mimeType": null
        }`), null)
    this.backendStorageService.populateChildren(parent);
    expect(this.lastConnection).toBeDefined('no http service connection at all?');
    expect(this.lastConnection.request.url)
      .toEqual("/emerald/storage/populate-children/20", 'url invalid');
  });

  it('populateChildren(null) should return storage root', fakeAsync(() => {
       let result: ITreeNode[];
       this.backendStorageService.populateChildren(null)
         .then((rootEntities: ITreeNode[]) => result = rootEntities);
       this.lastConnection.mockRespond(new Response(new ResponseOptions({
         body: `[
  {
    "id": 1,
    "type": "Zip",
    "text": "test3.zip",
    "children": null,
    "aquamarineId": null,
    "contentLength": null,
    "mimeType": null
  },
  {
    "id": 20,
    "type": "Zip",
    "text": "coll.zip",
    "children": null,
    "aquamarineId": null,
    "contentLength": null,
    "mimeType": null
  },
  {
    "id": 31,
    "type": "Zip",
    "text": "arc1.zip",
    "children": null,
    "aquamarineId": null,
    "contentLength": null,
    "mimeType": null
  }
]`,
       })));
       tick();
       expect(result.length).toEqual(3, 'There are exactly three entities');
       expect(result[2].id).toEqual(31, 'Third entity\'s id is 31');
       //expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
     }));

  it('populateChildren(null) while server is down', fakeAsync(() => {
       let result: ITreeNode[];
       let catchedError: any;
       this.backendStorageService.populateChildren(null)
         .then((rootEntities: ITreeNode[]) => result = rootEntities);
       this.lastConnection.mockRespond(new Response(new ResponseOptions({
         status: 404,
         statusText: 'URL not Found',
       })));
       tick();
       expect(result).toBeUndefined();
       //expect(catchedError).toBeDefined();
     }));
});
