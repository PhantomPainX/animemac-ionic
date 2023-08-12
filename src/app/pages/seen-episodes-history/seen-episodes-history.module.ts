import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeenEpisodesHistoryPageRoutingModule } from './seen-episodes-history-routing.module';

import { SeenEpisodesHistoryPage } from './seen-episodes-history.page';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeenEpisodesHistoryPageRoutingModule,
    LazyLoadImageModule
  ],
  declarations: [SeenEpisodesHistoryPage]
})
export class SeenEpisodesHistoryPageModule {}
