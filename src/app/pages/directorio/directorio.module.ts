import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DirectorioPageRoutingModule } from './directorio-routing.module';

import { DirectorioPage } from './directorio.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectorioPageRoutingModule,
    SharedDirectivesModule,
    ReactiveFormsModule,
    LazyLoadImageModule,
    ScrollingModule
  ],
  declarations: [DirectorioPage]
})
export class DirectorioPageModule {}
