import { TestBed, inject } from '@angular/core/testing';
import {Injectable, ReflectiveInjector} from '@angular/core';
import { EmeraldBackendStorageService } from './emerald-backend-storage.service';
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

describe('MockBackend EmeraldBackendStorageService Example', () => {
  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http, EmeraldBackendStorageService ]);
    this.backendStorageService = this.injector.get(EmeraldBackendStorageService);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
  });

  it('getHeroes() should query current service url', () => {
    this.backendStorageService.populateChildren(null);
    expect(this.lastConnection).toBeDefined('no http service connection at all?');
    expect(this.lastConnection.request.url).toEqual("/emerald/storage/populate-root", 'url invalid');
  });

  it('getHeroes() should return some heroes', fakeAsync(() => {
       let result: String[];
       this.heroService.getHeroes().then((heroes: String[]) => result = heroes);
       this.lastConnection.mockRespond(new Response(new ResponseOptions({
         body: JSON.stringify({data: []}),
       })));
       tick();
       expect(result.length).toEqual(2, 'should contain given amount of heroes');
       //expect(result[0]).toEqual(HERO_ONE, ' HERO_ONE should be the first hero');
       //expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
     }));

  it('getHeroes() while server is down', fakeAsync(() => {
       let result: String[];
       let catchedError: any;
       this.heroService.getHeroes()
           .then((heroes: String[]) => result = heroes)
           .catch((error: any) => catchedError = error);
       this.lastConnection.mockRespond(new Response(new ResponseOptions({
         status: 404,
         statusText: 'URL not Found',
       })));
       tick();
       expect(result).toBeUndefined();
       expect(catchedError).toBeDefined();
     }));
});
