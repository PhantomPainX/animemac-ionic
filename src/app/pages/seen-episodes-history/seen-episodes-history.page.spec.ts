import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeenEpisodesHistoryPage } from './seen-episodes-history.page';

describe('SeenEpisodesHistoryPage', () => {
  let component: SeenEpisodesHistoryPage;
  let fixture: ComponentFixture<SeenEpisodesHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SeenEpisodesHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
