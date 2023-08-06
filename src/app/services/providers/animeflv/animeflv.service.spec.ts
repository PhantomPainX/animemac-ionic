import { TestBed } from '@angular/core/testing';

import { AnimeflvService } from './animeflv.service';

describe('AnimeflvService', () => {
  let service: AnimeflvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimeflvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
