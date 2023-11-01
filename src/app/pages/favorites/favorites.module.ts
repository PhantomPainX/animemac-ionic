import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritesPageRoutingModule } from './favorites-routing.module';

import { FavoritesPage } from './favorites.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritesPageRoutingModule,
    SharedDirectivesModule,
    ReactiveFormsModule,
    LazyLoadImageModule,
    ScrollingModule
  ],
  declarations: [FavoritesPage]
})
export class FavoritesPageModule {}
