import { TestBed } from '@angular/core/testing';

import { AnimemeowService } from './animemeow.service';

describe('AnimemeowService', () => {
  let service: AnimemeowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimemeowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
