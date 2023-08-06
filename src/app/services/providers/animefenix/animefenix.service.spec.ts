import { TestBed } from '@angular/core/testing';

import { AnimefenixService } from './animefenix.service';

describe('AnimefenixService', () => {
  let service: AnimefenixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimefenixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
