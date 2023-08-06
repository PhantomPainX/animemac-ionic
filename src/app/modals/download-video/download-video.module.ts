import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DownloadVideoPageRoutingModule } from './download-video-routing.module';

import { DownloadVideoPage } from './download-video.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DownloadVideoPageRoutingModule
  ],
  declarations: [DownloadVideoPage]
})
export class DownloadVideoPageModule {}
