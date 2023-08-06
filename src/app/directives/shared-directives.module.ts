import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideHeaderDirective } from './hide-header.directive';
import { HideTabsDirective } from './hide-tabs.directive';



@NgModule({
  declarations: [
    HideHeaderDirective,
    HideTabsDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HideHeaderDirective
  ]
})
export class SharedDirectivesModule { }
