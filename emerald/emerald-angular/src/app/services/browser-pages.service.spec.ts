import { TestBed, inject } from '@angular/core/testing';

import { BrowserPagesService } from './browser-pages.service';

describe('BrowserPagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowserPagesService]
    });
  });

  it('should be created', inject([BrowserPagesService], (service: BrowserPagesService) => {
    expect(service).toBeTruthy();
  }));
});
