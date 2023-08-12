import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeenEpisodesHistoryPage } from './seen-episodes-history.page';

const routes: Routes = [
  {
    path: '',
    component: SeenEpisodesHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeenEpisodesHistoryPageRoutingModule {}
