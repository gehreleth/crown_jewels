import { TestBed, inject } from '@angular/core/testing';

import { ImgRegionEditorService } from './img-region-editor.service';

describe('ImgRegionEditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImgRegionEditorService]
    });
  });

  it('should be created', inject([ImgRegionEditorService], (service: ImgRegionEditorService) => {
    expect(service).toBeTruthy();
  }));
});
