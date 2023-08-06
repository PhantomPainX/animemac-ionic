import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit {

  public sliderOpts;
  constructor() {
    // this.sliderOpts = {
    //   freeMode: true,
    //   noSwiping: true,
    //   slidesPerView: 4,

    //   breakpoints: {
    //     640: {
    //       slidesPerView: 5,
    //     },
    //     768: {
    //       slidesPerView: 10,
    //     },
    //     1024: {
    //       slidesPerView: 15,
    //     },


    //   }

    // };
  }

  ngOnInit() {
  }

}
