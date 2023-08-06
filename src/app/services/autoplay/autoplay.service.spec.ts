import { TestBed } from '@angular/core/testing';

import { AutoplayService } from './autoplay.service';

describe('AutoplayService', () => {
  let service: AutoplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
