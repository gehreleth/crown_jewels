import { TestBed, inject } from '@angular/core/testing';

import { ImageMetadataService } from './image-metadata.service';

describe('ImageMetadataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageMetadataService]
    });
  });

  it('should be created', inject([ImageMetadataService], (service: ImageMetadataService) => {
    expect(service).toBeTruthy();
  }));
});
