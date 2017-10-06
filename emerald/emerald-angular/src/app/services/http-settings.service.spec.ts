import { TestBed, inject } from '@angular/core/testing';

import { HttpSettingsService } from './http-settings.service';

describe('HttpSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpSettingsService]
    });
  });

  it('should be created', inject([HttpSettingsService], (service: HttpSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
