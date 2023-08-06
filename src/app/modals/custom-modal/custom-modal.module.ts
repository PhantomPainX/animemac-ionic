import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomModalPageRoutingModule } from './custom-modal-routing.module';

import { CustomModalPage } from './custom-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomModalPageRoutingModule
  ],
  declarations: [CustomModalPage]
})
export class CustomModalPageModule {}
