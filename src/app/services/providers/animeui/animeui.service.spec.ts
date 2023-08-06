import { TestBed } from '@angular/core/testing';

import { AnimeuiService } from './animeui.service';

describe('AnimeuiService', () => {
  let service: AnimeuiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimeuiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
