import { TestBed } from '@angular/core/testing';

import { PoeService } from './poe.service';

describe('PoeService', () => {
  let service: PoeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
