import { TestBed } from '@angular/core/testing';

import { MoeService } from './moe.service';

describe('MoeService', () => {
  let service: MoeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
