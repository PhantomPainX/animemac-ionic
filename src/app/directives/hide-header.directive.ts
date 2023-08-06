import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DomController } from '@ionic/angular';
import { UtilsService } from '../services/utils.service';

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit {

  @Input('appHideHeader') header: any;

  public headerHeight: number = 0;

  public currentScroll: number;

  constructor(public renderer: Renderer2, public domCtrl: DomController) { }

  ngOnInit() {
    this.header = this.header.el;
  }

  ngAfterViewChecked() {
    this.headerHeight = this.header.clientHeight;
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event) {

    if (($event.detail.scrollTop > this.currentScroll) && ($event.detail.scrollTop > this.headerHeight)) {
      this.hideToolbar();
      this.currentScroll = $event.detail.scrollTop;

    } else if (this.currentScroll == 0) {
      this.showToolbar();
      this.currentScroll = 0;

    } else {
      this.showToolbar();
      this.currentScroll = $event.detail.scrollTop;
    }
    
  }

  hideToolbar() {
    this.domCtrl.write(() => {
      //añade transición de fade out
      this.renderer.setStyle(this.header, 'transition', 'top 500ms');
      this.renderer.setStyle(this.header, 'top', `-${this.headerHeight}px`);
    });
  }

  showToolbar() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.header, 'transition', 'top 500ms');
      this.renderer.setStyle(this.header, 'top', '0px');
    });
  }


}
