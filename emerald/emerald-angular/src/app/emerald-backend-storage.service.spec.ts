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
    expect(this.backendStorageService.Nodes.length)
    .toEqual(3, 'Three nodes in the cache are expected ');
    //expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
  }));

  it('populateChildren(null), then populateChildren(Nodes[0])', fakeAsync(() => {
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
    ]`,})));
    tick();
    expect(result.length).toEqual(3, 'There are exactly three entities');
    expect(result[2].id).toEqual(31, 'Third entity\'s id is 31');
    expect(this.backendStorageService.Nodes.length)
    .toEqual(3, 'Three nodes in the cache are expected ');

    this.backendStorageService.populateChildren(this.backendStorageService.Nodes[1])
    .then((rootEntities: ITreeNode[]) => result = rootEntities);
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: `[
        {
          "id": 21,
          "type": "Folder",
          "text": "coll",
          "children": null,
          "aquamarineId": null,
          "contentLength": null,
          "mimeType": null
        }
      ]`,})));
      tick();
      expect(result.length).toEqual(1, 'There are exactly one entity');
      expect(result[0].id).toEqual(21, 'Third entity\'s id is 31');
      expect(this.backendStorageService.Nodes.length)
      .toEqual(3, 'Three nodes in the root are expected ');
      expect(this.backendStorageService.Nodes[1].children.length)
      .toEqual(1, 'One child node of onde 20 expected ');
      expect(this.backendStorageService.Nodes[1].children[0].type)
      .toEqual(NodeType.Folder, 'Child is folder');
    }));

    it('getNodeById() should query current service url', () => {
        this.backendStorageService.getNodeById(12);
        expect(this.lastConnection).toBeDefined('no http service connection at all?');
        expect(this.lastConnection.request.url)
        .toEqual("/emerald/storage/populate-branch/12", 'url invalid');
      });

    it('populateChildren(null), then getNodeById()', fakeAsync(() => {
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
      ]`,})));
      tick();
      expect(result.length).toEqual(3, 'There are exactly three entities');
      expect(result[2].id).toEqual(31, 'Third entity\'s id is 31');
      expect(this.backendStorageService.Nodes.length)
      .toEqual(3, 'Three nodes in the cache are expected ');

      let result2: ITreeNode
      this.backendStorageService.getNodeById(12)
      .then((rootEntities: ITreeNode) => result2 = rootEntities);
      this.lastConnection.mockRespond(new Response(new ResponseOptions({
        body: `{
  "id": 1,
  "type": "Zip",
  "text": "test3.zip",
  "children": [
    {
      "id": 2,
      "type": "Folder",
      "text": "test3",
      "children": [
        {
          "id": 3,
          "type": "Folder",
          "text": "fold1",
          "children": null,
          "aquamarineId": null,
          "contentLength": null,
          "mimeType": null
        },
        {
          "id": 9,
          "type": "Folder",
          "text": "fold2",
          "children": [
            {
              "id": 10,
              "type": "Folder",
              "text": "b1",
              "children": [
                {
                  "id": 11,
                  "type": "Image",
                  "text": "504485_original.png",
                  "children": null,
                  "aquamarineId": "829b10c4-a3a2-4044-903f-b2b96d5292d2",
                  "contentLength": 36714,
                  "mimeType": "image/png"
                },
                {
                  "id": 12,
                  "type": "Image",
                  "text": "lena_color.gif",
                  "children": null,
                  "aquamarineId": "1bf3143d-0f93-4d68-857a-298178ecdb93",
                  "contentLength": 227335,
                  "mimeType": "image/gif"
                }
              ],
              "aquamarineId": null,
              "contentLength": null,
              "mimeType": null
            },
            {
              "id": 13,
              "type": "Folder",
              "text": "b2",
              "children": null,
              "aquamarineId": null,
              "contentLength": null,
              "mimeType": null
            }
          ],
          "aquamarineId": null,
          "contentLength": null,
          "mimeType": null
        },
        {
          "id": 16,
          "type": "Folder",
          "text": "fold3",
          "children": null,
          "aquamarineId": null,
          "contentLength": null,
          "mimeType": null
        }
      ],
      "aquamarineId": null,
      "contentLength": null,
      "mimeType": null
    }
  ],
  "aquamarineId": null,
  "contentLength": null,
  "mimeType": null
}`,})));
        tick();
        expect(result2.id).toEqual(12, 'Result should be valid');
        expect(result2.type).toEqual(NodeType.Image, 'Result should be valid');
        expect(result2.name).toEqual("lena_color.gif", 'Result should be valid');
        expect(result2.children).toBeNull('Leaf should\'t have children');
        expect(result2.aquamarineId).toEqual("1bf3143d-0f93-4d68-857a-298178ecdb93",
          'Result should be valid');
        expect(result2.contentLength).toEqual(227335, 'Result should be valid');
        expect(result2.mimeType).toEqual("image/gif", 'Result should be valid');

        result2 = result2.parent
        expect(result2.id).toEqual(10, 'Result should be valid');
        expect(result2.type).toEqual(NodeType.Folder, 'Result should be valid');

        result2 = result2.parent
        expect(result2.id).toEqual(9, 'Result should be valid');
        expect(result2.type).toEqual(NodeType.Folder, 'Result should be valid');

        result2 = result2.parent
        expect(result2.id).toEqual(2, 'Result should be valid');
        expect(result2.type).toEqual(NodeType.Folder, 'Result should be valid');

        result2 = result2.parent
        expect(result2.id).toEqual(1, 'Result should be valid');
        expect(result2.type).toEqual(NodeType.Zip, 'Result should be valid');
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
