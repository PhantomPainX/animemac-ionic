import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepliesPage } from './replies.page';

const routes: Routes = [
  {
    path: '',
    component: RepliesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepliesPageRoutingModule {}
