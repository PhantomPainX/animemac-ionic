import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FullVersionInfoPage } from './full-version-info.page';

const routes: Routes = [
  {
    path: '',
    component: FullVersionInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullVersionInfoPageRoutingModule {}
