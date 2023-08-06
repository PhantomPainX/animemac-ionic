import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArtificialIntelligencePage } from './artificial-intelligence.page';

const routes: Routes = [
  {
    path: '',
    component: ArtificialIntelligencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArtificialIntelligencePageRoutingModule {}
