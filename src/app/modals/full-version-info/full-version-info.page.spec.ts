import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullVersionInfoPage } from './full-version-info.page';

describe('FullVersionInfoPage', () => {
  let component: FullVersionInfoPage;
  let fixture: ComponentFixture<FullVersionInfoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FullVersionInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
