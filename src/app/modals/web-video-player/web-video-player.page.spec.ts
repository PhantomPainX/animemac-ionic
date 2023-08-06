import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebVideoPlayerPage } from './web-video-player.page';

describe('WebVideoPlayerPage', () => {
  let component: WebVideoPlayerPage;
  let fixture: ComponentFixture<WebVideoPlayerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WebVideoPlayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
