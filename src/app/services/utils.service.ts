import { Injectable } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { LoaderPage } from '../modals/loader/loader.page';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { FastAverageColor } from 'fast-average-color';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as moment from 'moment';
import { ImageViewerPage } from '../modals/image-viewer/image-viewer.page';

import { Browser } from '@capacitor/browser';

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { PreferencesService } from './preferences/preferences.service';
// import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  public statusBarHeight: string = "0";

  constructor(public toastCtrl: ToastController, public modalCtrl: ModalController, public platform: Platform, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, public preferences: PreferencesService,
    public navCtrl: NavController, public actionCtrl: ActionSheetController) {
    if (this.platform.is('android')) {
      this.statusBarHeight = localStorage.getItem('statusBarHeight');
    }
  }

  async showToast(message: string, seconds: number, vibration: boolean) {
    const toast: HTMLIonToastElement = await this.toastCtrl.create({
      message: message,
      duration: seconds*1000,
      mode: "ios",
    });
    if (vibration) {
      Haptics.impact({ style: ImpactStyle.Light });
    }
    return await toast.present();
  }

  async persistentToast(message: string) : Promise<HTMLIonToastElement> {
    const toast: HTMLIonToastElement = await this.toastCtrl.create({
      message: message,
      mode: "ios",
    });
    return toast;
  }

  async showIconToast(message: string, icon: string, seconds: number) {
    const toast: HTMLIonToastElement = await this.toastCtrl.create({
      message: message,
      icon: icon,
      duration: seconds*1000,
      mode: "ios",
    });
    return await toast.present();
  }

  async createLoader(): Promise<HTMLIonModalElement> {

    return new Promise<HTMLIonModalElement>(async (resolve, reject) => {

      const loader: HTMLIonModalElement = await this.modalCtrl.create({
        component: LoaderPage,
        cssClass: 'transparentModal',
        backdropDismiss: false
      });
      resolve(loader);
    });
  }

  async createIonicLoader(message: string): Promise<HTMLIonLoadingElement> {
    return new Promise<HTMLIonLoadingElement>(async (resolve) => {
      const loader: HTMLIonLoadingElement = await this.loadingCtrl.create({
        message: message,
        mode: "ios",
        translucent: true,
        spinner: "circular",
      });
      resolve(loader);
    });
  }

  async createLoaderToast(message: string, icon: string): Promise<HTMLIonToastElement> {
    return new Promise<HTMLIonToastElement>(async (resolve) => {

      const toast = await this.toastCtrl.create({
        mode: "ios",
        message: message,
        icon: icon
      });
      resolve(toast);
    });
  }

  async createIndeterminatedToast(message: string): Promise<HTMLIonToastElement> {

    return new Promise<HTMLIonToastElement>(async (resolve) => {

      const toast = await this.toastCtrl.create({
        mode: "ios",
        message: message
      });
      resolve(toast);
    });
  }


  async getMainColorFromRemoteImg(url: string) {
    const fac = new FastAverageColor();
    return fac.getColorAsync(url);
  }

  async resetStatusBarColorOfToolbar() {
    if (this.platform.is("android") && this.platform.is('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: false });
      const theme = await this.getAppTheme();
      if (theme.dark) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: "#081f25" });
      } else if (theme.light) {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: "#eefbff" });
      } else if (theme.dark_orange) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: "#230c00" });
      } else if (theme.system) {
        const systemTheme = await this.getDeviceSystemTheme();
        if (systemTheme === "dark") {
          StatusBar.setStyle({ style: Style.Dark });
          StatusBar.setBackgroundColor({ color: "#081f25" });
        } else if (systemTheme === "light") {
          StatusBar.setStyle({ style: Style.Light });
          StatusBar.setBackgroundColor({ color: "#eefbff" });
        }
      }
    }
  }

  async setDefaultStatusBarColor() {
    if (this.platform.is("android") && this.platform.is('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: false });
      const theme = await this.getAppTheme();
      if (theme.dark) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: "#07191e" });
      } else if (theme.light) {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: "#f5fdff" });
      } else if (theme.dark_orange) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: "#120600" });
      } else if (theme.system) {
        const systemTheme = await this.getDeviceSystemTheme();
        if (systemTheme === "dark") {
          StatusBar.setStyle({ style: Style.Dark });
          StatusBar.setBackgroundColor({ color: "#07191e" });
        } else if (systemTheme === "light") {
          StatusBar.setStyle({ style: Style.Light });
          StatusBar.setBackgroundColor({ color: "#f5fdff" });
        }
      }
    }
  }

  setStatusBarColor(color: string, style: Style) {
    if (this.platform.is("android") && this.platform.is('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: style });
      StatusBar.setBackgroundColor({ color: color });
    }
  }

  hideStatusbar() {
    if (this.platform.is('android') && this.platform.is('capacitor')) {
      StatusBar.hide();
    }
  }

  overlayStatusbar(overlay: boolean) {
    if (this.platform.is('android') && this.platform.is('capacitor')) {
      StatusBar.setOverlaysWebView({ overlay: overlay });
    }
  }

  setStatusBarStyle(dark: boolean) {
    if (this.platform.is('android') && this.platform.is('capacitor')) {
      if (dark) {
        StatusBar.setStyle({ style: Style.Dark });
      } else {
        StatusBar.setStyle({ style: Style.Light });
      }
    }
  }

  getBase64Image(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  async getDeviceSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    } else {
      return "light";
    }
  }

  async getAppTheme() {
    const settings = await this.preferences.getSettings();
    return settings.theme;
  }

  getStatusBarHeight(): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      const difference = screen.height - this.platform.height();
      resolve(difference);
    });
  }

  applyStatusBarHeight(element: HTMLElement) {
    element.style.paddingTop = this.statusBarHeight + "px";
  }

  dateAgo(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.fromNow();
  }

  formatFullDate(date: string) {
    //format date in DD/MM/YYYY HH:mm
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('DD/MM/YYYY HH:mm:ss');
  }

  formatDate(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('DD/MM/YYYY');
  }

  formatTime(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('HH:mm');
  }

  formatDayPretty(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('dddd');
  }

  formatDay(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('D');
  }

  formatMonthPretty(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('MMMM');
  }

  formatYear(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('YYYY');
  }
  
  formatTimePretty(date: string) {
    let myMoment: moment.Moment = moment(date);
    myMoment.locale('es');
    return myMoment.format('LT A');
  }

  getFileReader(): FileReader {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)["__zone_symbol__originalInstance"];
    return zoneOriginalInstance || fileReader;
  }

  async getRemoteImageBase64(image: string) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', image);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  async openImageViewer(images: any, title: string) {
    const modal = await this.modalCtrl.create({
      component: ImageViewerPage,
      cssClass: 'fullscreenModal',
      componentProps: {
        pictures: images,
        title: title,
        mode: "normal"
      }
    });
    await modal.present();

    await modal.onWillDismiss().then(() => {
      this.resetStatusBarColorOfToolbar();
    });
  }

  async purgeSession() {
    this.preferences.removeUser();
    this.preferences.setLogged(false);
    this.preferences.setGuest(false);


    const googleLogin = await this.preferences.getGoogleLogin();
    if (googleLogin) {
      GoogleAuth.signOut().then(() => {
        this.preferences.setGoogleLogin(false);
      }).catch(error => {
        console.log(error);
      });
    }

    // FirebaseMessaging.removeAllListeners();
    // FirebaseMessaging.deleteToken();
  }

  async showBanAlert() {
    this.alertCtrl.create({
      header: "Lo sentimos, fuiste baneado",
      subHeader: "Si deseas ver el motivo, intenta iniciar sesión nuevamente",
      message: "Si crees que esto es un error, contacta con nosotros a través del correo electrónico contacto@animemac.net",
      mode: 'ios',
      translucent: true,
      backdropDismiss: false,
      buttons: [
        {
          text: "Aceptar",
          role: "cancel",
          handler: () => {
            this.purgeSession();
            //check if modal is open, if so, close all modals
            if (this.modalCtrl.getTop()) {
              this.modalCtrl.dismiss();
            }

            //check if sheetController is open, if so, close all sheets
            if (this.actionCtrl.getTop()) {
              this.actionCtrl.dismiss();
            }

            //check if loader is open, if so, close all loaders
            if (this.loadingCtrl.getTop()) {
              this.loadingCtrl.dismiss();
            }
            this.navCtrl.navigateRoot('/welcome', { animated: true, animationDirection: 'back', replaceUrl: true });
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
    return;
  }

  async outdatedAppAlert(newVersion: string, downloadUrl: string) {
    this.alertCtrl.create({
      header: "Estas usando una versión antigua de la aplicación",
      subHeader: "Actualizala para poder seguir usándola",
      message: `Versión más actual: ${newVersion}`,
      mode: 'ios',
      translucent: true,
      backdropDismiss: false,
      buttons: [
        {
          text: "Cerrar",
          handler: () => {
            App.exitApp();
          }
        },
        {
          text: "Descargar",
          handler: () => {
            Browser.open({ url: downloadUrl });
            Browser.addListener('browserFinished', async () => {
              const toast = await this.createIndeterminatedToast("La aplicación se cerrara en 3 segundos...");
              toast.present();
              setTimeout(() => {
                toast.dismiss();
                App.exitApp();
              }, 3000);
            });
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
    return;
  }

  openSimpleUrl(url: string) {
    Browser.open({ url: url });
  }

  getVideoMimeType(url: string) {
    if (url.includes('.mp4')) {
      return 'video/mp4';
    } else if (url.includes('.m3u8')) {
      return 'application/x-mpegURL';
    } else if (url.includes('.mpd')) {
      return 'application/dash+xml';
    } else if (url.includes('.webm')) {
      return 'video/webm';
    } else if (url.includes('.ogg')) {
      return 'video/ogg';
    } else if (url.includes('.mov')) {
      return 'video/quicktime';
    } else if (url.includes('.avi')) {
      return 'video/x-msvideo';
    } else if (url.includes('.flv')) {
      return 'video/x-flv';
    } else if (url.includes('.wmv')) {
      return 'video/x-ms-wmv';
    } else if (url.includes('.3gp')) {
      return 'video/3gpp';
    } else if (url.includes('.3g2')) {
      return 'video/3gpp2';
    } else if (url.includes('.mkv')) {
      return 'video/x-matroska';
    } else if (url.includes('.ts')) {
      return 'video/MP2T';
    } else if (url.includes('.m4v')) {
      return 'video/x-m4v';
    } else if (url.includes('.f4v')) {
      return 'video/x-f4v';
    } else if (url.includes('.f4p')) {
      return 'video/x-f4p';
    } else if (url.includes('.f4a')) {
      return 'video/x-f4a';
    } else {
      return 'video/mp4';
    }
  }

  getVideoFormat(url: string) {
    if (url.includes('mp4')) {
      return '.mp4';
    } else if (url.includes('m3u8')) {
      return '.m3u8';
    } else if (url.includes('mpd')) {
      return '.mpd';
    } else if (url.includes('webm')) {
      return '.webm';
    } else if (url.includes('ogg')) {
      return '.ogg';
    } else if (url.includes('mov')) {
      return '.mov';
    } else if (url.includes('avi')) {
      return '.avi';
    } else if (url.includes('flv')) {
      return '.flv';
    } else if (url.includes('wmv')) {
      return '.wmv';
    } else if (url.includes('3gp')) {
      return '.3gp';
    } else if (url.includes('3g2')) {
      return '.3g2';
    } else if (url.includes('mkv')) {
      return '.mkv';
    } else if (url.includes('.ts')) {
      return '.ts';
    } else if (url.includes('m4v')) {
      return '.m4v';
    } else if (url.includes('.f4v')) {
      return '.f4v';
    } else if (url.includes('.f4p')) {
      return '.f4p';
    } else if (url.includes('.f4a')) {
      return '.f4a';
    } else {
      return '.mp4';
    }
  }

  convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  formatSeconds(seconds: number) {
    let result = '';
    if (seconds > 3600) {
      result = new Date(seconds * 1000).toISOString().slice(11, 19);
    } else {
      result = new Date(seconds * 1000).toISOString().slice(14, 19);
    }
    return result;
  }

  hexToRgba(hex: string, alpha: number = 1): string {
    const hexValue = hex.replace("#", "");
    const red = parseInt(hexValue.substring(0, 2), 16);
    const green = parseInt(hexValue.substring(2, 4), 16);
    const blue = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  getRgbFromString(rgbaString: string): number[] {
    const matches = rgbaString.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  }
}
