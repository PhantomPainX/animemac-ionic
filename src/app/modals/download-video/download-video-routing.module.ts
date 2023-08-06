import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DownloadVideoPage } from './download-video.page';

const routes: Routes = [
  {
    path: '',
    component: DownloadVideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DownloadVideoPageRoutingModule {}
