import { TestBed } from '@angular/core/testing';

import { RepliesService } from './replies.service';

describe('RepliesService', () => {
  let service: RepliesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepliesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
