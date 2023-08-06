import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageViewerPageRoutingModule } from './image-viewer-routing.module';

import { ImageViewerPage } from './image-viewer.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageViewerPageRoutingModule
  ],
  declarations: [ImageViewerPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageViewerPageModule {}
