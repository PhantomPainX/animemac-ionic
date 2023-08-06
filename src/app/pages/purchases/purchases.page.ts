import { Component, OnInit } from '@angular/core';
// import { IAPProduct, InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';

const CERO_ADS = 'zero_ads';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.page.html',
  styleUrls: ['./purchases.page.scss'],
})
export class PurchasesPage implements OnInit {

  public cero_ads_user: boolean = false;
  // public products: IAPProduct[] = [];

  constructor(public platform: Platform) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      // this.store.verbosity = this.store.DEBUG;
      
      // this.registerProducts();
      // this.setupListeners();

      // this.store.ready(() => {
      //   console.log('Store ready: ' + JSON.stringify(this.store.products));
      //   this.products = this.store.products;
      // });
    });
  }

  // registerProducts() {
  //   this.store.register({
  //     id: CERO_ADS,
  //     alias: CERO_ADS,
  //     type: this.store.NON_CONSUMABLE
  //   });

  //   this.store.refresh();
  // }

  // setupListeners() {
  //   this.store.when('product').approved((p: IAPProduct) => {
  //     if (p.id === CERO_ADS) {
  //       this.cero_ads_user = true;
  //     }

  //     return p.verify();

  //   }).verified((p: IAPProduct) => p.finish());

  //   this.store.when(CERO_ADS).owned((p: IAPProduct) => {
  //     this.cero_ads_user = true;
  //   });
  // }

  // purchase(product: IAPProduct) {
  //   this.store.order(product).then(() => {
  //     console.log('Purchase successful');
  //   }).catch((err) => {
  //     console.log('Purchase failed: ' + err);
  //   });
  
  // }

}
