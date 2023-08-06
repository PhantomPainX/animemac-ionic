import { TestBed } from '@angular/core/testing';

import { MysqlDatabaseService } from './mysql-database.service';

describe('MysqlDatabaseService', () => {
  let service: MysqlDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MysqlDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
