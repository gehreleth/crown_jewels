import { TestBed, inject } from '@angular/core/testing';

import { EmeraldBackendStorageService } from './emerald-backend-storage.service';

describe('EmeraldBackendStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmeraldBackendStorageService]
    });
  });

  it('should be created', inject([EmeraldBackendStorageService], (service: EmeraldBackendStorageService) => {
    expect(service).toBeTruthy();
  }));
});
