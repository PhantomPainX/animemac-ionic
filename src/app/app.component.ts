import { Component } from '@angular/core';
import { Platform, ToastController, ModalController, NavController, MenuController, AlertController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { StatusBar, Style } from '@capacitor/status-bar';

import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NavigationExtras, NavigationStart, Router } from '@angular/router';

import { UtilsService } from './services/utils.service';
import { PrivateUser } from './classes/private-user/private-user';
import { PreferencesService } from './services/preferences/preferences.service';
import { Browser } from '@capacitor/browser';
import { MysqlDatabaseService } from './services/mysql-database.service';
import { environment } from 'src/environments/environment.prod';
import { Subscription } from 'rxjs';
import { AppLauncher, CanOpenURLResult } from '@capacitor/app-launcher';
import { register } from 'swiper/element/bundle';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { SigninPage } from './pages/auth/signin/signin.page';
import { ProfileService } from './services/profile/profile.service';
import { RegisterPage } from './pages/auth/register/register.page';
import { Settings } from './interfaces/settings';
import { ThemeService } from './services/theme/theme.service';
import { SharingService } from './core/services/sharing/sharing.service';
import { FullVersionInfoPage } from './modals/full-version-info/full-version-info.page';

import { AppUpdate, AppUpdateAvailability, AppUpdateInfo, FlexibleUpdateInstallStatus, AppUpdateResult, AppUpdateResultCode } from '@capawesome/capacitor-app-update';
import { App } from '@capacitor/app';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(public sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {

  public toast: HTMLIonToastElement;
  public loader: HTMLIonModalElement;
  public user: PrivateUser;
  public domain: string = environment.root_url;
  public logged: boolean;
  public profileImage: string = "assets/icon/avatar.svg";
  public types: any = null;
  public status: any = null;
  public languages: any = null;

  public staticGenres: any = null;
  public genres: any = null;

  public staticYears: any[] = null;
  public years: any[] = null;

  // Is lite version
  public liteVersion: boolean = environment.liteVersion;

  public timeOnApp: number = 0;
  private recentlyLoggedSubscription: Subscription;
  private updatedUserExtraSubscription: Subscription;
  private themeChangedSubscription: Subscription;

  public updateAvailable: boolean = false;
  private appUpdateInterval: any;

  private systemColorSchemeListener: any;

  constructor(public platform: Platform, public toastCtrl: ToastController, public modalCtrl: ModalController, 
    public screenOrientation: ScreenOrientation, public router: Router, public utils: UtilsService, public navCtrl: NavController, 
    public menu: MenuController, public localStorage: PreferencesService, public database: MysqlDatabaseService, public alertCtrl: AlertController, 
    public profileService: ProfileService, private themeService: ThemeService, private sharingService: SharingService) {

      // Detectar si el usuario refresca la página

      // const sub = this.router.events.subscribe((event) => {
      //   if (event instanceof NavigationStart) {
      //     let browserRefresh = !this.router.navigated;
      //     console.log("browserRefresh", browserRefresh);
      //   }
      // });

      this.recentlyLoggedSubscription = this.sharingService.getRecentlyLogged().subscribe(async (logged) => {
        if (logged) {
          this.loggedVerification();
        }
      });

      this.updatedUserExtraSubscription = this.sharingService.getUserExtra().subscribe(async (updated) => {
        if (updated) {
          const oldImage = this.fixImage(this.profileImage);
          const temp_user = await this.localStorage.getUser();
          const newImage = this.fixImage(temp_user.user_extra.avatar);

          if (oldImage != newImage) {
            this.user = await this.localStorage.getUser();
            this.profileImage = this.fixImage(this.user.user_extra.avatar);
          }
        }
      });
  }

  ngOnInit() {

    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        this.utils.setDefaultStatusBarColor();
      }
      this.changeToPortraitOrientation();
      this.addColorSchemeListener();
      this.addNetworkListener();
      this.checkUserStatus();

      if (this.liteVersion) {
        if (this.platform.is('android') && this.platform.is('capacitor')) {
          this.checkAppUpdate();

          this.appUpdateInterval = setInterval(() => {
            this.checkAppUpdate();
          }, 5400000); // 1 hora 30 min
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.systemColorSchemeListener) {
      this.systemColorSchemeListener.removeEventListener('change', this.systemThemeHandler.bind(this));
    }
    Network.removeAllListeners();
    if (this.updatedUserExtraSubscription) {
      this.updatedUserExtraSubscription.unsubscribe();
    }
    if (this.recentlyLoggedSubscription) {
      this.recentlyLoggedSubscription.unsubscribe();
    }
    if (this.themeChangedSubscription) {
      this.themeChangedSubscription.unsubscribe();
    }

    if (this.liteVersion) {
      this.appUpdateInterval.clearInterval();
    }
  }

  // Ve si es la primera vez que se abre la aplicación y si el usuario esta logeado o es invitado
  // Configura los datos persistentes de la aplicación dependiendo de si es la primera vez que se abre o no
  async checkUserStatus() {
    let localLogged = false;
    let localGuest = false;

    this.localStorage.setIsDownloading(false);

    const userFirstTime = await this.localStorage.userFirstTime();
    if (userFirstTime === null) {
      await this.localStorage.setUserFirstTime(true);
    }

    if (userFirstTime === true || userFirstTime === null) {

      const localSettings = await this.localStorage.getSettings();
      if (localSettings === null) {
        let settings: Settings = {
          chromecastEnabled: true,
          pipEnabled: true,
          aditionalProviders: true,
          theme: {
            dark: false,
            light: false,
            dark_orange: false,
            system: true
          }
        };
        this.localStorage.setSettings(settings);
      } else {
        if (localSettings.aditionalProviders === undefined) {
          localSettings.aditionalProviders = true;
          this.localStorage.setSettings(localSettings);
        }
        if (localSettings.theme === undefined) {
          localSettings.theme = {
            dark: false,
            light: false,
            dark_orange: false,
            system: true
          }
          this.localStorage.setSettings(localSettings);
        }
      }

      const deserveAd = await this.localStorage.getDeserveAd();
      if (deserveAd === null) {
        this.localStorage.setDeserveAd(false);
      }

      const withoutAdVideoViews = await this.localStorage.getWithoutAdVideoViews();
      if (withoutAdVideoViews === null) {
        this.localStorage.setWithoutAdVideoViews(0);
      }

      localLogged = await this.localStorage.getLogged();
      if (localLogged === null) {
        localLogged = false;
        this.localStorage.setLogged(false);
      }

      localGuest = await this.localStorage.getGuest();
      if (localGuest === null) {
        localGuest = false;
        this.localStorage.setGuest(false);
      }

      const localAcceptedTerms = await this.localStorage.getAcceptedTerms();
      if (localAcceptedTerms === null) {
        this.localStorage.setAcceptedTerms(true);
      }

      const localGoogleLogin = await this.localStorage.getGoogleLogin();
      if (localGoogleLogin === null) {
        this.localStorage.setGoogleLogin(false);
      }

      this.localStorage.setUserFirstTime(false);

      const biometricCompatible = await this.localStorage.biometricCompatible();
      if (biometricCompatible === null) {
        if (this.platform.is('capacitor')) {
          const bioResult = await NativeBiometric.isAvailable();
          if (bioResult.isAvailable) {
            this.localStorage.setBiometricCompatible(true);
          } else {
            this.localStorage.setBiometricCompatible(false);
          }
        } else {
          this.localStorage.setBiometricCompatible(false);
        }
      }

    } else {

      localLogged = await this.localStorage.getLogged();
      if (localLogged === null) {
        localLogged = false;
        this.localStorage.setLogged(false);
      }

      localGuest = await this.localStorage.getGuest();
      if (localGuest === null) {
        localGuest = false;
        this.localStorage.setGuest(false);
      }

      const biometricCompatible = await this.localStorage.biometricCompatible();
      if (biometricCompatible === null) {
        if (this.platform.is('capacitor')) {
          const bioResult = await NativeBiometric.isAvailable();
          if (bioResult.isAvailable) {
            this.localStorage.setBiometricCompatible(true);
          } else {
            this.localStorage.setBiometricCompatible(false);
          }
        } else {
          this.localStorage.setBiometricCompatible(false);
        }
      }

      const localSettings = await this.localStorage.getSettings();
      if (localSettings.theme === undefined) {
        localSettings.theme = {
          dark: false,
          light: false,
          dark_orange: false,
          system: true
        }
        this.localStorage.setSettings(localSettings);
      }
    }

    if (localLogged || localGuest) {
      this.navCtrl.navigateRoot("/tablinks/home", { animated: false, replaceUrl: true });
      this.loggedVerification();
    } else if (!localLogged) {
      this.navCtrl.navigateRoot("/welcome", { animated: false, replaceUrl: true });
    }
    this.loadMenuCategories();
  }

  async addNetworkListener() {
    await Network.getStatus().then(async network => {
      if (network.connectionType === 'none') {
        await this.showIndeterminatedToast('Esperando una conexión...');
      }
    });
    // networkStatusChange is never fired
    Network.addListener('networkStatusChange', async s => {
      console.log('networkStatusChange', s);

      if (s.connectionType === 'none') {
        if (this.toastCtrl.getTop()) {
          await this.showIndeterminatedToast('Esperando una conexión...');
        }
      } else {
        await this.toast.dismiss();
      }
    });
  }

  loadMenuCategories() {
    this.database.getRecursiveData(this.domain + "/api/v1/genres/", []).then(async (genres) => {
      this.genres = genres;
      this.staticGenres = genres;
    });

    this.database.getRecursiveData(this.domain + "/api/v1/types/", []).then(async (types) => {
      this.types = types;
    });

    this.database.getRecursiveData(this.domain + "/api/v1/status/", []).then(async (status) => {
      this.status = status;
    });

    this.database.getRecursiveData(this.domain + "/api/v1/languages/", []).then(async (languages) => {
      this.languages = languages;
    });

    //add in years list from 1967 to current year
    this.years = [];
    for (let i = 1967; i <= new Date().getFullYear(); i++) {
      this.years.push(i);
    }
    this.years.reverse();
    this.staticYears = this.years;
  }

  changeToPortraitOrientation() {
    if (this.platform.is('capacitor')) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }

  addColorSchemeListener() {
    this.themeChangedSubscription = this.sharingService.getThemeChanged().subscribe(async (theme) => {
      if (this.systemColorSchemeListener) {
        this.systemColorSchemeListener.removeEventListener('change', this.systemThemeHandler.bind(this));
      }

      if (theme.dark) {
        this.setTheme('dark');
      } else if (theme.light) {
        this.setTheme('light');
      } else if (theme.dark_orange) {
        this.setTheme('dark_orange');
      } else if (theme.system) {
        this.utils.getDeviceSystemTheme().then(systemTheme => {
          if (systemTheme === 'dark') {
            this.setTheme('dark');
          } else if (systemTheme === 'light') {
            this.setTheme('light');
          }
        });
        this.addSystemThemeListener();
      }
    });
    this.localStorage.getSettings().then(settings => {
      if (settings) {
        this.sharingService.emitThemeChanged(settings.theme);
      }
    });
  }

  setTheme(theme: string) {
    document.body.className = '';
    if (theme === 'dark') {
      document.body.classList.add('dark');
      if (this.platform.is('android') && this.platform.is('capacitor')) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#081f25' });
      }
    } else if (theme === 'light') {
      document.body.classList.add('light');
      if (this.platform.is('android') && this.platform.is('capacitor')) {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#eefbff' });
      }
    } else if (theme === 'dark_orange') {
      document.body.classList.add('dark_orange');
      if (this.platform.is('android') && this.platform.is('capacitor')) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#081f25' });
      }
    }
  }

  addSystemThemeListener() {
    this.systemColorSchemeListener = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemColorSchemeListener.addEventListener('change', this.systemThemeHandler.bind(this));
  }

  async systemThemeHandler(event) {
    const appTheme = await this.utils.getAppTheme();
    if (appTheme.system) {
      const newColorScheme = event.matches ? "dark" : "light";
      if (newColorScheme === 'dark') {
        this.setTheme('dark');
      } else {
        this.setTheme('light');
      }
    }
  }

  async showIndeterminatedToast(message: string) {
    this.toast = await this.toastCtrl.create({
      message: message,
      mode: 'ios',
    });
    return this.toast.present();
  }

  // html functions

  public goToSignin() {
    this.modalCtrl.create({
      component: SigninPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    }).then(modal => {
      modal.present();
    });
    this.menu.close();
  }

  public goToSignup() {
    this.modalCtrl.create({
      component: RegisterPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    }).then(modal => {
      modal.present();
    });
    this.menu.close();
  }

  public async openSocial(social: string) {
    if (social === 'discord') {
      const { value }: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.discord' });
      if (value) {
        AppLauncher.openUrl({ url: 'https://discord.com/invite/WGtBBZSpWW' });
      } else {
        Browser.open({ url: 'https://discord.com/invite/WGtBBZSpWW' });
      }
    } else if (social === 'twitter') {
      const { value }: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.twitter.android' });
      if (value) {
        AppLauncher.openUrl({ url: 'https://twitter.com/animemacweb' });
      } else {
        Browser.open({ url: 'https://twitter.com/animemacweb' });
      }
    } else if (social === 'instagram') {
      const { value }: CanOpenURLResult = await AppLauncher.canOpenUrl({ url: 'com.instagram.android' });
      if (value) {
        AppLauncher.openUrl({ url: 'https://www.instagram.com/animemac.web/' });
      } else {
        Browser.open({ url: 'https://www.instagram.com/animemac.web/' });
      }
    }
  }

  public async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Si',
          handler: () => {
            this.menu.close();
            this.profileImage = "assets/icon/avatar.svg";
            this.database.purgeSession();
            this.navCtrl.navigateRoot('/welcome', { animated: true, animationDirection: 'back', replaceUrl: true });
            this.logged = false;
          }
        }
      ]
    });
    await alert.present();
  }

  public closeMenu() {
    this.menu.close();
  }

  public seeMore(type: string, title: string, layoutStyle: string, dynamicId: string) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        type: type,
        title: title,
        layoutStyle: layoutStyle,
        dynamicId: dynamicId
      }
    };
    this.menu.close();
    this.navCtrl.navigateForward('/see-more', navigationExtras);

  }

  public searchYear(event) {
    if (event.target.value.length == 0) {
      this.years = this.staticYears;
    } else {
      this.years = this.staticYears.filter(year => year.toString().includes(event.target.value));
    }
  }
  
  public searchCategory(event) {
    if (event.target.value.length == 0) {
      this.genres = this.staticGenres;
    } else {
      this.genres = this.staticGenres.filter(genre => genre.genero.toLowerCase().includes(event.target.value.toLowerCase()));
    }
  }

  async loggedVerification() {
    this.logged = await this.localStorage.getLogged();

    if (this.logged) {
      this.user = await this.localStorage.getUser();
      
      if (!this.user.user_extra.avatar.includes(this.domain)) {
          this.profileImage = this.domain + this.user.user_extra.avatar;
      } else {
          this.profileImage = this.user.user_extra.avatar;
      }
    }
  }

  fixImage(url: string) {
    if (!url.includes(this.domain)) {
      url = this.domain + "/" + url;
    }
    return url;
  }

  public async openFullVersionInfoModal() {
    const modal = await this.modalCtrl.create({
      component: FullVersionInfoPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    })
    modal.present();
  }

  private checkAppUpdate() {
    AppUpdate.getAppUpdateInfo().then((updateInfo) => {
      console.log('updateInfo -> ' + JSON.stringify(updateInfo))
      if (updateInfo.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        this.updateAvailable = true;
        this.showUpdateToast(updateInfo);
      }
    });
  }

  private async showUpdateToast(updateInfo: AppUpdateInfo) {
    const toast = await this.toastCtrl.create({
      header: 'Actualización disponible',
      message: 'Hay una nueva versión disponible, ¿Deseas actualizar?',
      mode: 'ios',
      position: 'bottom',
      layout: 'stacked',
      buttons: [
        {
          text: 'Actualizar',
          handler: () => {
            if (this.platform.is('android')) {
              if (updateInfo.immediateUpdateAllowed) {
                this.beginUpdate(1);
              } else {
                this.beginUpdate(2);
              }
            } else if (this.platform.is('ios')) {
              if (updateInfo.minimumOsVersion === '13.0') {
                this.beginUpdate(2);
              } else {
                this.utils.showToast('Actualiza tu sistema operativo para poder actualizar la aplicación.', 2, false);
              }
            }
          }
        },
        {
          text: 'Más tarde',
          role: 'cancel',
          handler: () => {
            this.utils.showToast('Te recordaremos en un rato más. Recuerda que en el menú lateral puedes actualizar la aplicación cuando quieras.', 3, false);
          }
        }
      ]
    });
    toast.present();
  }

  public beginUpdate(process: number) {
    if (process === 1) {
      AppUpdate.performImmediateUpdate();
    } else if (process === 2) {
      AppUpdate.openAppStore();
    }
  }
}
