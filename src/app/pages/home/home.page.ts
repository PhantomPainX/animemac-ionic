import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonInfiniteScroll, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { EpisodePage } from '../episode/episode.page';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { Subscription } from 'rxjs';
import { ProvidersPopoverComponent } from 'src/app/components/providers-popover/providers-popover.component';
import { environment } from 'src/environments/environment.prod';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { IonicSlides } from '@ionic/angular';

import { SwiperContainer } from 'swiper/element';
import { AutoplayOptions } from 'swiper/types';
import { SigninPage } from '../auth/signin/signin.page';
import { RegisterPage } from '../auth/register/register.page';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { VideoPlayerService } from 'src/app/services/video-player/video-player.service';
import { WebVideoPlayerPage } from 'src/app/modals/web-video-player/web-video-player.page';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';
//import { ResolversService } from 'src/app/services/resolvers/resolvers.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild("episodesInfiniteScroll") episodesInfiniteScroll: IonInfiniteScroll;
  @ViewChild("animesInfiniteScroll") animesInfiniteScroll: IonInfiniteScroll;
  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;
  @ViewChild('swiperContainerBroadcast') swiperContainerBroadcast: SwiperContainer;
  @ViewChild('swiperContainerLatestAnimes') swiperContainerLatestAnimes: SwiperContainer;

  public swiperModules = [IonicSlides];
  public latestEpisodes: any;
  public latestAnimes: any;
  public latestLatino: any;
  public latestSeries: any;
  public inBroadcast: any;
  public nextToSee: any = undefined;
  public domain: string = environment.root_url;

  public isLogged: boolean = false;
  public user: PrivateUser;
  public token: string = "";
  public animeSwiperBreakpoints: any;
  public autoplaySwiperOptions: AutoplayOptions;
  public nextToSeeSwiperBreakpoints: any;
  public chipsOptions: any;

  public profileImage: string = "";

  public nextToSeeListener: any;
  public fetchingNextToSee: boolean = false;

  private recentlyLoggedSubscription: Subscription;
  private updatedUserExtraSubscription: Subscription;
  private episodeTimeSeenChangedSubscription: Subscription;
  private toggleSeenEpisodeSubscription: Subscription;

  // public func = () => {
  //   this.zone.run(() => {
  //     this.obtainNextToSee();
  //   });
  // }


  // Subscriptions
  public routerSubscription: Subscription;

  // Is lite version
  public liteVersion: boolean = environment.liteVersion;
  public allowedUserInLiteVersion: boolean = false;

  constructor(public database: MysqlDatabaseService,
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public platform: Platform,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public utils: UtilsService,
    private localStorage: PreferencesService,
    public route: ActivatedRoute,
    public menu: MenuController,
    public zone: NgZone,
    public iab: InAppBrowser,
    public profileService: ProfileService,
    public videoPlayerService: VideoPlayerService,
    private sharingService: SharingService
    //private resolvers: ResolversService
    ) {

    this.chipsOptions = {
      slidesPerView: 3,
      spaceBetween: 2,
      freeMode: true
    }

    this.autoplaySwiperOptions = {
      delay: 6000
    }

    this.animeSwiperBreakpoints = {
      0: {
        slidesPerView: 1.1,
        spaceBetween: 10,
      },
      620: {
        slidesPerView: 1.7,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: 3.1,
        spaceBetween: 10,
      }

    };

    this.nextToSeeSwiperBreakpoints = {
      0: {
        slidesPerView: 1.1,
        spaceBetween: 10,
      },
      320: {
        slidesPerView: 1.3,
        spaceBetween: 10,
      },
      620: {
        slidesPerView: 2.3,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: 3.3,
        spaceBetween: 10,
      }
    };

  }

  ngOnInit() {

    this.platform.ready().then(async () => {
      this.utils.resetStatusBarColorOfToolbar();

      //this.resolvers.streamhubResolver("https://streamhub.gg/e/80tgkehdb3xc");

      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
        this.token = this.user.token;
        this.profileImage = this.fixImage(this.user.user_extra.avatar);
        // Usuarios que pueden ver videos usando la versión lite de la aplicación
        this.allowedUserInLiteVersion = this.user.is_staff || this.user.is_superuser || this.user.groups.moderator || this.user.groups.vip;
        this.obtainNextToSee();
        this.toggleSeenEpisodeSubscription = this.sharingService.getSeenEpisode().subscribe(async () => {
          this.obtainNextToSee();
        });
        this.episodeTimeSeenChangedSubscription = this.sharingService.getEpisodeTimeSeen().subscribe(async () => {
          this.obtainNextToSee();
        });
      } else {
        this.recentlyLoggedSubscription = this.sharingService.getRecentlyLogged().subscribe(async (logged) => {
          this.isLogged = logged;
          if (this.isLogged) {
            this.user = await this.localStorage.getUser();
            this.token = this.user.token;
            this.profileImage = this.fixImage(this.user.user_extra.avatar);
            this.allowedUserInLiteVersion = this.user.is_staff || this.user.is_superuser || this.user.groups.moderator || this.user.groups.vip;
            this.obtainNextToSee();
            this.toggleSeenEpisodeSubscription = this.sharingService.getSeenEpisode().subscribe(async () => {
              this.obtainNextToSee();
            });
            this.episodeTimeSeenChangedSubscription = this.sharingService.getEpisodeTimeSeen().subscribe(async () => {
              this.obtainNextToSee();
            });
            this.recentlyLoggedSubscription.unsubscribe();
          }
        });
      }

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

      this.obtainInBroadcast();
      this.obtainLatestAnimes();
      this.obtainLatestLatino();
      this.obtainLatestSeries();
      this.obtainLatestEpisodes();

      // this.routerSubscription = this.route.queryParams.subscribe(async () => {
      //   this.isLogged = await this.localStorage.getLogged();
      //   if (this.isLogged) {

      //     const oldImage = this.fixImage(this.profileImage);
      //     const temp_user = await this.localStorage.getUser();
      //     const newImage = this.fixImage(temp_user.user_extra.avatar);

      //     if (oldImage != newImage) {
      //       this.user = await this.localStorage.getUser();
      //       this.profileImage = this.fixImage(this.user.user_extra.avatar);
      //     }
      //   }
      // });
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.recentlyLoggedSubscription) {
      this.recentlyLoggedSubscription.unsubscribe();
    }

    if (this.updatedUserExtraSubscription) {
      this.updatedUserExtraSubscription.unsubscribe();
    }

    if (this.episodeTimeSeenChangedSubscription) {
      this.episodeTimeSeenChangedSubscription.unsubscribe();
    }

    if (this.toggleSeenEpisodeSubscription) {
      this.toggleSeenEpisodeSubscription.unsubscribe();
    }

    // if (this.nextToSee != undefined) {
    //   document.removeEventListener('itemInserted', this.func, false);
    // }
  }

  fixImage(url: string) {
    if (!url.includes(this.domain)) {
      url = this.domain + "/" + url;
    }
    return url;
  }

  async obtainNextToSee() {
    if (this.fetchingNextToSee) {
      return;
    } else {
      this.fetchingNextToSee = true;
      await this.database.getNextToSee(this.user.token).then(async data => {
        if (data.episodes) {
          let dataClean = data.episodes.filter(episode => episode.id != undefined);
          if (dataClean.length == 0) {
            this.nextToSee = undefined;
            this.fetchingNextToSee = false;
            return;
          }

          dataClean = dataClean.filter((episode, index, self) =>
            index === self.findIndex((t) => (
              t.id === episode.id
            )));
          
          if (dataClean.length == 0) {
            this.nextToSee = undefined;
            this.fetchingNextToSee = false;
            return;
          }

          for (let d of dataClean) {
            await this.utils.getMainColorFromRemoteImg(d.anime.imagen).then(color => {
              d.color = color;
            });

            if (d.seconds_seen != null && d.seconds_seen.seconds != 0) {
              // calcular el % de progreso respecto a seconds y total_seconds
              d.progress = d.seconds_seen.seconds / d.seconds_seen.total_seconds;
            }
          }
  
          this.nextToSee = dataClean;
          this.fetchingNextToSee = false;
        } else {
          this.nextToSee = undefined;
          this.fetchingNextToSee = false;
        }
      });
    }
  }

  async obtainLatestEpisodes() {
    this.latestEpisodes = undefined;
    await this.database.getLatestEpisodes(1, this.token).then(data => {
      this.latestEpisodes = data.results.slice(0, 10);

      for (let episode of this.latestEpisodes) {
        if (episode.seconds_seen != null && episode.seconds_seen.seconds != 0) {
          episode.progress = episode.seconds_seen.seconds / episode.seconds_seen.total_seconds;
        }
      }
    });
  }

  async obtainLatestAnimes() {
    this.latestAnimes = undefined;
    await this.database.getAnimes(1, "-agregado", false, this.token).then(data => {
      this.latestAnimes = data.results.slice(0, 12);
    });
  }

  async obtainLatestLatino() {
    this.latestLatino = undefined;
    await this.database.getLatino(1, "-agregado", false, this.token).then(data => {
      this.latestLatino = data.results.slice(0, 16);

    });
  }

  async obtainLatestSeries() {
    this.latestSeries = undefined;
    await this.database.getSeries(1, "-agregado", false, this.token).then(data => {
      this.latestSeries = data.results.slice(0, 16);
    });
  }

  async obtainInBroadcast() {
    this.inBroadcast = undefined;
    await this.database.getInBroadcast(1, "-agregado", false, this.token).then(data => {
      this.inBroadcast = data.results.slice(0, 5);
    });
  }

  async goToAnimeDetail(anime: any) {
    this.navCtrl.navigateForward('/detail/'+anime.id, { animated: true, animationDirection: 'forward' });
  }

  async openProviders(event, episode) {

    if (!this.platform.is('capacitor')) {
      const loader = await this.utils.createIonicLoader("Cargando reproductor...");
      await loader.present();
      this.database.getAnimeDetail(episode.anime.id, this.token).then(async anime => {
        await loader.dismiss();
        episode.anime = anime;
        const modal = await this.modalCtrl.create({
          component: WebVideoPlayerPage,
          cssClass: 'rounded-modal',
          breakpoints: [0, 1],
          initialBreakpoint: 1,
          // canDismiss: false,
          componentProps: {
            episode: episode
          }
        })
        modal.present();
      }).catch(async () => {
        await loader.dismiss();
        this.utils.showToast("Ha ocurrido un error, intenta más tarde", 2, false);
      });
    } else {

      if (!episode.anime.imagen.includes(this.domain)) {
        episode.anime.imagen = this.domain + episode.anime.imagen;
      }
      const popover = await this.popoverCtrl.create({
        component: ProvidersPopoverComponent,
        event: event,
        cssClass: "custom-popover",
        componentProps: {
          episode: episode,
          animeImage: episode.anime.imagen,
          animeName: episode.anime.nombre,
          liteVersion: this.liteVersion,
          allowedUserInLiteVersion: this.allowedUserInLiteVersion
        }
      });
      await popover.present();
    }
  }

  async openOptions() {

    var buttons = [];

    if (this.isLogged) {
      this.navCtrl.navigateForward('/profile', { animated: true, animationDirection: 'forward' })
    } else {
      buttons = [
        {
          text: 'Iniciar sesión',
          icon: 'log-in',
          handler: async () => {
            const modal = await this.modalCtrl.create({
              component: SigninPage,
              cssClass: 'rounded-modal',
              breakpoints: [0, 1],
              initialBreakpoint: 1,
            })
            modal.present();
          }
        },
        {
          text: 'Crear cuenta',
          icon: 'person-add',
          handler: () => {
            this.modalCtrl.create({
              component: RegisterPage,
              cssClass: 'rounded-modal',
              breakpoints: [0, 1],
              initialBreakpoint: 1,
            }).then(modal => {
              modal.present();
            });
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          icon: 'close'
        }
      ];

      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Opciones',
        buttons: buttons
      });
      await actionSheet.present();
    }

  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Si',
          handler: () => {
            if (this.nextToSee != undefined) {
              document.removeEventListener('itemInserted', this.obtainNextToSee, false);
            }
            this.database.purgeSession();
            this.navCtrl.navigateRoot('/welcome', { animated: true, animationDirection: 'back', replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }


  // Opciones Extras

  async toggleFavorite(anime: any) {
    const loader = await this.utils.createLoaderToast("Espera un momento...", "sync");
    await loader.present();

    await this.database.toggleFavoriteAnime(this.user.token, anime.id).then((added) => {

      loader.dismiss();
      if (added) {
        this.utils.showIconToast(anime.nombre+" fue agregado a tus favoritos", "heart", 2);
      } else {
        this.utils.showIconToast(anime.nombre+" fue eliminado de tus favoritos", "trash", 2);
      }
    }).catch(() => {
      loader.dismiss();
    });
  }

  async toggleEpisode(episode: any) {
    const loader = await this.utils.createIonicLoader("Espera un momento...");
    await loader.present();

    await this.database.toggleSeenEpisode(this.user.token, episode.id).then((added) => {

      if (added) {
        this.utils.showToast("Marcado como visto", 1, true);
      } else {
        this.utils.showToast("Desmarcado como visto", 1, true);
      }
    }).catch(error => {
      console.log(error);
    });
    await loader.dismiss();
  }

  async openEpisodesModal(anime: any) {
    const modal = await this.modalCtrl.create({
      component: EpisodePage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        anime: anime,
        totalEpisodes: anime.episodios.length
      }
    });
    await modal.present();
  }

  async openAnimeOptions(anime: any) {

    let epButtonText = "Episodios";
    let epButtonHandler = () => {
      this.openEpisodesModal(anime);
    }
    if ((anime.tipo.toLowerCase() == "película" || anime.tipo.toLowerCase() == "ova" || anime.tipo.toLowerCase() == "especial") && anime.episodios.length == 1) {
      switch (anime.tipo.toLowerCase()) {
        case "película":
          epButtonText = "Ver Película";
          break;
        case "ova":
          epButtonText = "Ver OVA";
          break;
        case "especial":
          epButtonText = "Ver Especial";
          break;
        default:
          break;
      }
      anime.episodios[0].anime = anime;
      epButtonHandler = () => {
        this.openProviders(undefined, anime.episodios[0])
      }
    }

    var buttons = [{
      text: 'Ver Detalle',
      icon: 'information-circle',
      handler: () => {
        this.goToAnimeDetail(anime);
      }
    },{
      text: epButtonText,
      icon: 'play',
      handler: epButtonHandler
    }, {
      text: 'Ver Comentarios',
      icon: 'chatbubbles',
      handler: () => {
        this.modalCtrl.create({
          component: CommentPage,
          cssClass: 'rounded-modal',
          canDismiss: true,
          breakpoints: [0, 1],
          initialBreakpoint: 1,
          componentProps: {
            anime: anime,
            commentsType: 'anime'
          }
        }).then(modal => {
          modal.present();
        });
      }
    }, {
      text: 'Cerrar',
      role: 'cancel',
      icon: 'close'
    }
    ];

    if (this.isLogged) {
      buttons.push({
        text: 'Añadir / Eliminar de favoritos',
        icon: 'heart',
        handler: () => {
          this.toggleFavorite(anime);
        }
      }, {
        text: 'Cerrar',
        role: 'cancel',
        icon: 'close'
      });
    }

    const subHeaderText = "Agregado el " + this.utils.formatDayPretty(anime.agregado) + " " + this.utils.formatDay(anime.agregado) + " de " + this.utils.formatMonthPretty(anime.agregado) + " del " + this.utils.formatYear(anime.agregado) + " a las " + this.utils.formatTimePretty(anime.agregado);
    const actionSheet = await this.actionSheetCtrl.create({
      header: anime.nombre,
      subHeader: subHeaderText,
      buttons: buttons
    });
    await actionSheet.present();
  }

  async openEpisodeOptions(episode: any) {

    var buttons = [{
      text: 'Ver Detalle',
      icon: 'information-circle',
      handler: () => {
        this.goToAnimeDetail(episode.anime);
      }
    },
    {
      text: 'Descargar',
      icon: 'cloud-download',
      handler: async () => {
        if (!this.platform.is('capacitor')) {
          this.utils.showToast("No disponible en la web, descarga la aplicación", 1, false);
          return;
        }

        if (!this.liteVersion || this.allowedUserInLiteVersion) {
          const popover = await this.popoverCtrl.create({
            component: ProvidersPopoverComponent,
            cssClass: "custom-popover",
            componentProps: {
              download: true,
              episode: episode,
              animeImage: episode.anime.imagen,
              animeName: episode.anime.nombre
            }
          });
      
          popover.present();
        } else {
          this.utils.showToast("No disponible en la versión lite de la aplicación", 1, false);
        }
      }
    }, {
      text: 'Ver Comentarios',
      icon: 'chatbubbles',
      handler: () => {
        this.modalCtrl.create({
          component: CommentPage,
          cssClass: 'rounded-modal',
          canDismiss: true,
          breakpoints: [0, 1],
          initialBreakpoint: 1,
          componentProps: {
            episode: episode,
            commentsType: 'episode'
          }
        }).then(modal => {
          modal.present();
        });
      }
    },
    {
      text: 'Cerrar',
      role: 'cancel',
      icon: 'close'
    }];


    if (this.isLogged) {
      buttons.push({
        text: 'Añadir / Eliminar de favoritos',
        icon: 'heart',
        handler: () => {
          this.toggleFavorite(episode.anime);
        }
      }, {
        text: 'Marcar como visto / No visto',
        icon: 'eye',
        handler: () => {
          this.toggleEpisode(episode);
        }
      }, {
        text: 'Cerrar',
        role: 'cancel',
        icon: 'close'
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: episode.anime.nombre,
      subHeader: "Episodio "+episode.numero,
      buttons: buttons
    });
    await actionSheet.present();
  }

  async seeMore(type: string) {

    var title = "";
    var layoutStyle = "";
    if (type == "in-broadcast") {
      title = "En Emisión";
      layoutStyle = "grid";
    } else if (type == "latin") {
      title = "En Latino";
      layoutStyle = "grid";
    } else if (type == "japanese") {
      title = "En Japonés";
      layoutStyle = "grid";
    } else if (type == "series") {
      title = "Series";
      layoutStyle = "grid";
    } else if (type == "latest-episodes") {
      title = "Últimos Episodios";
      layoutStyle = "list";
    }

    // const modal = await this.modalCtrl.create({
    //   component: SeeMorePage,
    //   cssClass: 'fullscreenModal',
    //   componentProps: {
    //     type: type,
    //     title: title,
    //     layoutStyle: layoutStyle
    //   }
    // });
    // await modal.present();

    //go to see more page with params
    this.navCtrl.navigateForward('/see-more', { queryParams: { type: type, title: title, layoutStyle: layoutStyle } });
  }

  openMenu() {
    this.menu.open();
  }
  openEnd() {
    this.menu.open('end');
  }
  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  async openThatModal() {
    const browser = this.iab.create('https://www.poe.com', '_system', 'location=no');
    browser.show();

    //check if browser is closed
    browser.on('loadstop').subscribe(event => {
      //execute script to get cookies
      browser.executeScript({
        code: "document.cookie"
      }).then((cookie) => {
        //set cookies
        console.log("Cookies 1: "+cookie);
      });
    });

    browser.on('exit').subscribe(event => {
      browser.executeScript({
        code: "document.cookie"
      }).then((cookie) => {
        //set cookies
        console.log("Cookies 2: "+cookie);
      });
    });
  }

  changeTheme() {
    const theme1 = {
      primary: '#3880ff',
      secondary: '#0cd1e8',
      tertiary: '#7044ff',
      success: '#10dc60',
      warning: '#ffce00',
      danger: '#f04141',
      dark: '#222428',
      medium: '#989aa2',
      light: '#f4f5f8',
      background: '#f4f5f8'
    };

    document.body.style.setProperty('--ion-color-primary', theme1.primary);
    document.body.style.setProperty('--ion-color-primary-rgb', '56, 128, 255');
    document.body.style.setProperty('--ion-color-primary-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-primary-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-primary-shade', '#3171e0');
    document.body.style.setProperty('--ion-color-primary-tint', '#4c8dff');

    document.body.style.setProperty('--ion-color-secondary', theme1.secondary);
    document.body.style.setProperty('--ion-color-secondary-rgb', '12, 209, 232');
    document.body.style.setProperty('--ion-color-secondary-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-secondary-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-secondary-shade', '#0da6b5');
    document.body.style.setProperty('--ion-color-secondary-tint', '#24c6dc');

    document.body.style.setProperty('--ion-color-tertiary', theme1.tertiary);
    document.body.style.setProperty('--ion-color-tertiary-rgb', '112, 68, 255');
    document.body.style.setProperty('--ion-color-tertiary-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-tertiary-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-tertiary-shade', '#9e42f5');
    document.body.style.setProperty('--ion-color-tertiary-tint', '#b554ff');

    document.body.style.setProperty('--ion-color-success', theme1.success);
    document.body.style.setProperty('--ion-color-success-rgb', '16, 220, 96');
    document.body.style.setProperty('--ion-color-success-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-success-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-success-shade', '#0e995d');
    document.body.style.setProperty('--ion-color-success-tint', '#24d07a');

    document.body.style.setProperty('--ion-color-warning', theme1.warning);
    document.body.style.setProperty('--ion-color-warning-rgb', '255, 206, 0');
    document.body.style.setProperty('--ion-color-warning-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-warning-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-warning-shade', '#e0ac00');
    document.body.style.setProperty('--ion-color-warning-tint', '#ffd31a');

    document.body.style.setProperty('--ion-color-danger', theme1.danger);
    document.body.style.setProperty('--ion-color-danger-rgb', '245, 61, 61');
    document.body.style.setProperty('--ion-color-danger-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-danger-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-danger-shade', '#d40909');
    document.body.style.setProperty('--ion-color-danger-tint', '#f22a2a');

    document.body.style.setProperty('--ion-color-dark', theme1.dark);
    document.body.style.setProperty('--ion-color-dark-rgb', '34, 34, 34');
    document.body.style.setProperty('--ion-color-dark-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-dark-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-dark-shade', '#1e1e1e');
    document.body.style.setProperty('--ion-color-dark-tint', '#383838');

    document.body.style.setProperty('--ion-color-medium', theme1.medium);
    document.body.style.setProperty('--ion-color-medium-rgb', '152, 154, 162');
    document.body.style.setProperty('--ion-color-medium-contrast', '#ffffff');
    document.body.style.setProperty('--ion-color-medium-contrast-rgb', '255, 255, 255');
    document.body.style.setProperty('--ion-color-medium-shade', '#9e9e9e');
    document.body.style.setProperty('--ion-color-medium-tint', '#bcbcbc');

    document.body.style.setProperty('--ion-color-light', theme1.light);
    document.body.style.setProperty('--ion-color-light-rgb', '244, 245, 248');
    document.body.style.setProperty('--ion-color-light-contrast', '#000000');
    document.body.style.setProperty('--ion-color-light-contrast-rgb', '0, 0, 0');
    document.body.style.setProperty('--ion-color-light-shade', '#d7d8da');
    document.body.style.setProperty('--ion-color-light-tint', '#f5f6f9');

    document.body.style.setProperty('--ion-background-color', theme1.background);
    document.body.style.setProperty('--ion-background-color-rgb', '244, 245, 248');
    
  
  }

}
