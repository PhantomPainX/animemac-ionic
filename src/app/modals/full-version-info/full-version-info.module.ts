import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FullVersionInfoPageRoutingModule } from './full-version-info-routing.module';

import { FullVersionInfoPage } from './full-version-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FullVersionInfoPageRoutingModule
  ],
  declarations: [FullVersionInfoPage]
})
export class FullVersionInfoPageModule {}
