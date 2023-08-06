import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PushNotificationPageRoutingModule } from './push-notification-routing.module';

import { PushNotificationPage } from './push-notification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PushNotificationPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [PushNotificationPage]
})
export class PushNotificationPageModule {}
