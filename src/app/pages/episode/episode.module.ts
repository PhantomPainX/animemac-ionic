import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EpisodePageRoutingModule } from './episode-routing.module';

import { EpisodePage } from './episode.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedDirectivesModule,
    EpisodePageRoutingModule,
    LazyLoadImageModule,
    ScrollingModule
  ],
  declarations: [EpisodePage]
})
export class EpisodePageModule {}
