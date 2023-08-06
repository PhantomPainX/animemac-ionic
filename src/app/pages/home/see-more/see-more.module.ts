import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeeMorePageRoutingModule } from './see-more-routing.module';

import { SeeMorePage } from './see-more.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeeMorePageRoutingModule,
    SharedDirectivesModule,
    ReactiveFormsModule,
    LazyLoadImageModule
  ],
  declarations: [SeeMorePage]
})
export class SeeMorePageModule {}
