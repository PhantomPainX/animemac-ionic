import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomModalPage } from './custom-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CustomModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomModalPageRoutingModule {}
