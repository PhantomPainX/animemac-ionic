import { Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appHideTabs]'
})
export class HideTabsDirective implements OnInit {

  @Input('appHideTabs') tabs: any;

  public tabsHeight: number = 0;

  public currentScroll: number;

  constructor(public renderer: Renderer2, public domCtrl: DomController) { }

  ngOnInit() {
    this.tabs = this.tabs.el;
  }

  ngAfterViewChecked() {
    this.tabsHeight = this.tabs.clientHeight;
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event) {

    if ($event.detail.scrollTop > this.currentScroll) {
      this.hideToolbar();
      this.currentScroll = $event.detail.scrollTop;

    } else if (this.currentScroll == 0 || this.currentScroll < 0) {
      this.showToolbar();
      this.currentScroll = 0;

    } else {
      this.showToolbar();
      this.currentScroll = $event.detail.scrollTop;
    }
    
  }

  hideToolbar() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.tabs, 'transition', 'top 500ms');
      this.renderer.setStyle(this.tabs, 'top', `-${this.tabsHeight}px`);
    });
  }

  showToolbar() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.tabs, 'transition', 'top 500ms');
      this.renderer.setStyle(this.tabs, 'top', '0px');
    });
  }

}
