import { TestBed, inject } from '@angular/core/testing';
import { RegionTagsService } from './region-tags.service';

describe('RegionTagsServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegionTagsService]
    });
  });

  it('should be created', inject([RegionTagsService], (service: RegionTagsService) => {
    expect(service).toBeTruthy();
  }));
});
