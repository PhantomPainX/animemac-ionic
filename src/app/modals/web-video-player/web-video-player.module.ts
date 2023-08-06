import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WebVideoPlayerPageRoutingModule } from './web-video-player-routing.module';

import { WebVideoPlayerPage } from './web-video-player.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WebVideoPlayerPageRoutingModule
  ],
  declarations: [WebVideoPlayerPage]
})
export class WebVideoPlayerPageModule {}
