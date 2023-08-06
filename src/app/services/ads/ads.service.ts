import { Injectable } from '@angular/core';
// import { AdMob, AdMobRewardItem, AdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';
import { PluginListenerHandle } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { PreferencesService } from '../preferences/preferences.service';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  constructor(public alertCtrl: AlertController, public utils: UtilsService, public localStorage: PreferencesService) {
    // this.initializeAdMob();
  }

  // async initializeAdMob() {
  //   const { status } = await AdMob.trackingAuthorizationStatus();

  //   if (status === 'notDetermined') {
  //     console.log('requesting permission');
  //   }

  //   await AdMob.initialize({
  //     requestTrackingAuthorization: true,
  //     initializeForTesting: true,
  //   });
  // }

  // async fireInterstitialAd() {
  //   const options: AdOptions = {
  //     adId: '',
  //     isTesting: true,
  //   };
  //   await AdMob.prepareInterstitial(options);
  //   await AdMob.showInterstitial();
  // }

  // async showBanner() {
  //   const options: BannerAdOptions = {
  //     adId : '',
  //     adSize: BannerAdSize.ADAPTIVE_BANNER,
  //     position: BannerAdPosition.BOTTOM_CENTER,
  //     margin: 0,
  //     isTesting: true
  //   }
  //   await AdMob.showBanner(options);
  // }

  // async resumeBanner() {
  //   await AdMob.resumeBanner();
  // }

  // async removeBanner() {
  //   await AdMob.removeBanner();
  // }

  // async fireRewardAdWithAlert(header: string, message: string, loader: boolean) {
  //   return new Promise(async (resolve, reject) => {

  //     const alert = await this.alertCtrl.create({
  //       header: header,
  //       message: message,
  //       mode: 'ios',
  //       translucent: true,
  //       buttons: [
  //         {
  //           text: 'Cancelar',
  //           role: 'cancel',
  //           handler: () => {
  //             reject({
  //               cancelled: true
  //             });
  //           }
  //         }, {
  //           text: 'Aceptar',
  //           handler: async () => {

  //             var reward = false;

  //             if (loader) {
  //               var loaderElement = await this.utils.createIonicLoader("Cargando anuncio...");
  //               await loaderElement.present();
  //             }
              
  //             //assign event listeners
              

  //             const rewardedListener: PluginListenerHandle = AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
  //               reward = true;
  //               rewardedListener.remove();
  //             });

  //             const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
  //               if (reward) {
  //                 const deserveAd = await this.localStorage.getDeserveAd();
  //                 if (deserveAd) {
  //                   await this.localStorage.setDeserveAd(false);
  //                 }
  //                 resolve(true);
  //               } else {
  //                 reject({
  //                   cancelled: true
  //                 });
  //               }
  //               dismissedListener.remove();
  //             });

  //             const showedListener: PluginListenerHandle = AdMob.addListener(RewardAdPluginEvents.Showed, () => {
  //               if (loader) {
  //                 loaderElement.dismiss();
  //               }
  //               showedListener.remove();
  //             });

  //             const failedToLoadListener: PluginListenerHandle = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, async () => {
  //               if (loader) {
  //                 loaderElement.dismiss();
  //               }

  //               const deserveAd = await this.localStorage.getDeserveAd();
  //               if (deserveAd) {
  //                 await this.localStorage.setDeserveAd(false);
  //               }

  //               this.utils.showToast("No se pudo cargar el anuncio... Mostrando video", 2, false);
  //               reject({
  //                 cancelled: false
  //               });
  //               failedToLoadListener.remove();
  //             });

  //             const failedToShow: PluginListenerHandle = AdMob.addListener(RewardAdPluginEvents.FailedToShow, async () => {
  //               //console.log("ERROR ", JSON.stringify(error));
  //               if (loader) {
  //                 loaderElement.dismiss();
  //               }

  //               const deserveAd = await this.localStorage.getDeserveAd();
  //               if (deserveAd) {
  //                 await this.localStorage.setDeserveAd(false);
  //               }

  //               this.utils.showToast("No se pudo mostrar el anuncio... Mostrando video", 2, false);
  //               reject({
  //                 cancelled: false
  //               });
  //               failedToShow.remove();
  //             });

  //             const options: RewardAdOptions = {
  //               adId: '',
  //               isTesting: true,

  //             };
  //             await AdMob.prepareRewardVideoAd(options);
  //             await AdMob.showRewardVideoAd();
  //           }
  //         }
  //       ]
  //     });
  //     await alert.present();
  //   });
  // }
}
