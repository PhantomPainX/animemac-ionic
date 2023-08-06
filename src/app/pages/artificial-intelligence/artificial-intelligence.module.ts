import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArtificialIntelligencePageRoutingModule } from './artificial-intelligence-routing.module';

import { ArtificialIntelligencePage } from './artificial-intelligence.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArtificialIntelligencePageRoutingModule
  ],
  declarations: [ArtificialIntelligencePage]
})
export class ArtificialIntelligencePageModule {}
