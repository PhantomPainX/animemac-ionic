import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeeUsersPageRoutingModule } from './see-users-routing.module';

import { SeeUsersPage } from './see-users.page';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeeUsersPageRoutingModule,
    ScrollingModule
  ],
  declarations: [SeeUsersPage]
})
export class SeeUsersPageModule {}
