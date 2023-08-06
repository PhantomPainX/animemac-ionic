import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArtificialIntelligencePage } from './artificial-intelligence.page';

describe('ArtificialIntelligencePage', () => {
  let component: ArtificialIntelligencePage;
  let fixture: ComponentFixture<ArtificialIntelligencePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtificialIntelligencePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtificialIntelligencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
