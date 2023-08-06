import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WebVideoPlayerPage } from './web-video-player.page';

const routes: Routes = [
  {
    path: '',
    component: WebVideoPlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebVideoPlayerPageRoutingModule {}
