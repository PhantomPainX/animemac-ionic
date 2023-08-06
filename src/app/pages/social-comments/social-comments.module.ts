import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SocialCommentsPageRoutingModule } from './social-comments-routing.module';

import { SocialCommentsPage } from './social-comments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SocialCommentsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SocialCommentsPage]
})
export class SocialCommentsPageModule {}
