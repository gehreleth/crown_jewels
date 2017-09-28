import { TestBed, inject } from '@angular/core/testing';

import { RegionEditorService } from './region-editor.service';

describe('RegionEditorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegionEditorService]
    });
  });

  it('should be created', inject([RegionEditorService], (service: RegionEditorService) => {
    expect(service).toBeTruthy();
  }));
});
