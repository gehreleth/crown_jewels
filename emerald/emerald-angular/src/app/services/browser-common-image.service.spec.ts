import { TestBed, inject } from '@angular/core/testing';

import { BrowserCommonImageService } from './browser-common-image.service';

describe('BrowserCommonImageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrowserCommonImageService]
    });
  });

  it('should be created', inject([BrowserCommonImageService], (service: BrowserCommonImageService) => {
    expect(service).toBeTruthy();
  }));
});
