import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { AnimefenixService } from 'src/app/services/providers/animefenix/animefenix.service';
import { AnimeflvService } from 'src/app/services/providers/animeflv/animeflv.service';
import { AnimeuiService } from 'src/app/services/providers/animeui/animeui.service';
import { environment } from 'src/environments/environment.prod';
import { EmbedsPopoverComponent } from '../embeds-popover/embeds-popover.component';
import { AnimemeowService } from 'src/app/services/providers/animemeow/animemeow.service';
import { Browser } from '@capacitor/browser';
import { FullVersionInfoPage } from 'src/app/modals/full-version-info/full-version-info.page';

@Component({
  selector: 'app-providers-popover',
  templateUrl: './providers-popover.component.html',
  styleUrls: ['./providers-popover.component.scss'],
})
export class ProvidersPopoverComponent implements OnInit {

  @Input() download: boolean;
  @Input() episode: any;
  @Input() embedRequested: boolean;
  @Input() animeImage: string;
  @Input() animeName: string;
  @Input() liteVersion: boolean;
  @Input() allowedUserInLiteVersion: boolean;
  public isLogged: boolean = false;
  public domain: string = environment.root_url;

  private liteToast = null;

  // Providers

  public aditionalProviders: boolean = true;

  //AnimeMac
  public animemacAvailable: boolean = false;
  public fetchingAnimemac: boolean = true;
  public animemacEmbeds: any = [];

  //AnimeUI
  public animeuiAvailable: boolean = false;
  public fetchingAnimeui: boolean = true;
  public animeuiEmbeds: any = [];

  // AnimeFenix
  public animefenixAvailable: boolean = false;
  public fetchingAnimefenix: boolean = true;
  public animefenixEmbeds: any = [];

  // AnimeFLV
  public animeflvAvailable: boolean = false;
  public fetchingAnimeflv: boolean = true;
  public animeflvEmbeds: any = [];

  // AnimeMeow
  public animemeowAvailable: boolean = false;
  public fetchingAnimemeow: boolean = true;
  public animemeowEmbeds: any = [];

  constructor(public database: MysqlDatabaseService, public popoverCtrl: PopoverController, public alertCtrl: AlertController, 
    public animeui: AnimeuiService, public localStorage: PreferencesService, public platform: Platform, 
    public animefenix: AnimefenixService, public animeflv: AnimeflvService, public animemeow: AnimemeowService, 
    private toastCtrl: ToastController, private modalCtrl: ModalController) { }

  ngOnInit() {

    if (!this.animeImage.includes(this.domain)) {
      this.animeImage = this.domain + this.animeImage;
    }

    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      const settings = await this.localStorage.getSettings();
      this.aditionalProviders = settings.aditionalProviders;

      // Si la version de la aplicación no es lite o si es lite pero el usuario tiene acceso a ver videos ondemand
      if (!this.liteVersion || this.allowedUserInLiteVersion) {
        this.getAnimeMacEmbeds();
    
        if (this.aditionalProviders) {
          // this.getAnimeUiEmbeds();
          this.getAnimefenixEmbeds();
          this.getAnimeflvEmbeds();
          this.getAnimemeowEmbeds();
        }
      } else {
        this.fetchingAnimemac = false;
        this.animemacAvailable = true;
        this.fetchingAnimeui = false;
        this.animeuiAvailable = true;
        this.fetchingAnimefenix = false;
        this.animefenixAvailable = true;
        this.fetchingAnimeflv = false;
        this.animeflvAvailable = true;
        this.fetchingAnimemeow = false;
        this.animemeowAvailable = true;

        this.liteToast = await this.toastCtrl.create({
          message: "Recuerda que en la versión Lite no puedes ver videos dentro de la aplicación",
          mode: "ios",
          position: "bottom",
          layout: "stacked",
          buttons: [
            {
              text: "Más información",
              role: "action",
              side: "end",
              handler: () => {
                this.openFullVersionInfoModal();
              }
            },
          ]
        });

        this.liteToast.present();
      }
    });
  }

  ngOnDestroy() {
    if (this.liteToast && this.liteVersion) {
      this.liteToast.dismiss();
    }
  }

  async openEmbedsPopover(event, provider) {

    // Si la version de la aplicación no es lite o si es lite pero el usuario tiene acceso a ver videos ondemand
    if (!this.liteVersion || this.allowedUserInLiteVersion) {
      if (!this.isLogged && !this.embedRequested) {
        const alert = await this.alertCtrl.create({
          header: 'Acceso Restringido',
          message: 'Para poder ver los videos debes iniciar sesión',
          mode: 'ios',
          translucent: true,
          buttons: [
            {
              text: 'Aceptar',
              role: 'cancel'
            }
          ]
        });
        await alert.present();
        return;
      }

      if (provider == "animemac") {
        var componentProps = {
          download: this.download,
          embedRequested: this.embedRequested,
          animeName: this.animeName,
          animeImage: this.animeImage,
          episode: this.episode,
          embeds: this.animemacEmbeds,
          providerName: 'AnimeMac'
        }
      } else if (provider == "animeui") {
        var componentProps = {
          download: this.download,
          embedRequested: this.embedRequested,
          animeName: this.animeName,
          animeImage: this.animeImage,
          episode: this.episode,
          embeds: this.animeuiEmbeds,
          providerName: 'AnimeUI'
        }
      } else if (provider == "animefenix") {
        var componentProps = {
          download: this.download,
          embedRequested: this.embedRequested,
          animeName: this.animeName,
          animeImage: this.animeImage,
          episode: this.episode,
          embeds: this.animefenixEmbeds,
          providerName: 'AnimeFenix'
        }
      } else if (provider == "animeflv") {
        var componentProps = {
          download: this.download,
          embedRequested: this.embedRequested,
          animeName: this.animeName,
          animeImage: this.animeImage,
          episode: this.episode,
          embeds: this.animeflvEmbeds,
          providerName: 'AnimeFLV'
        }
      } else if (provider == "animemeow") {
        var componentProps = {
          download: this.download,
          embedRequested: this.embedRequested,
          animeName: this.animeName,
          animeImage: this.animeImage,
          episode: this.episode,
          embeds: this.animemeowEmbeds,
          providerName: 'AnimeMeow'
        }
      }

      const popover = await this.popoverCtrl.create({
        component: EmbedsPopoverComponent,
        cssClass: "custom-popover",
        event: event,
        componentProps: componentProps
      });
      await popover.present();
      await popover.onDidDismiss().then(async (data) => {
        if (data.data) {
          if (data.data.openedVideo) {
            this.popoverCtrl.dismiss();
          } else if (data.data.embedReady) {
            this.popoverCtrl.dismiss({
              embedReady: data.data.embedReady,
              embedUrl: data.data.embedUrl,
              embedName: data.data.embedName
            });
          }
        }
      });
    } else {
      let url = "";
      switch (provider) {
        case "animemac":
          url = this.domain + "/ver/" + this.episode.slug;
          break;
        case "animeui":
          url = "https://animeui.com/directory?title=" + this.animeName;
          break;
        case "animefenix":
          url = "https://animefenix.tv/animes?q=" + this.animeName;
          break;
        case "animeflv":
          url = "https://www3.animeflv.net/browse?q=" + this.animeName;
          break;
        case "animemeow":
          url = "https://animemeow.xyz/directorio/?q=" + this.animeName;
          break;
        default:
          break;
      }

      url = url.replace(/ /g, "+");
      Browser.open({ url: url });
    }
  }

  async getAnimeMacEmbeds() {
    await this.database.getEpisodeDetail(this.episode).then(async data => {
      this.fetchingAnimemac = false;
      if (data.length > 0) {
        this.animemacAvailable = true;
        this.animemacEmbeds = data;
      }
    }).catch(async error => {
      this.fetchingAnimemac = false;
      console.log(error);
    });

  }

  getAnimeUiEmbeds() {
    this.animeui.getEmbeds(this.animeName, this.episode.numero).then(async (embeds: any) => {
      this.fetchingAnimeui = false;
      if (embeds.length > 0) {
        this.animeuiAvailable = true;
        this.animeuiEmbeds = embeds;
      }
    }).catch(async error => {
      this.fetchingAnimeui = false;
      console.log(error);
    });
  }

  getAnimefenixEmbeds() {
    this.animefenix.getEmbeds(this.episode).then(async (embeds: any) => {
      this.fetchingAnimefenix = false;
      if (embeds.length > 0) {
        this.animefenixAvailable = true;
        this.animefenixEmbeds = embeds;
      }
    }).catch(async error => {
      this.fetchingAnimefenix = false;
      console.log(error);
    });
  }

  getAnimeflvEmbeds() {
    this.animeflv.getEmbeds(this.animeName, this.episode.numero).then(async (embeds: any) => {
      this.fetchingAnimeflv = false;
      if (embeds.length > 0) {
        this.animeflvAvailable = true;
        this.animeflvEmbeds = embeds;
      }
    }).catch(async error => {
      this.fetchingAnimeflv = false;
      console.log(error);
    });
  }

  getAnimemeowEmbeds() {
    this.animemeow.getEmbeds(this.animeName, this.episode.numero).then(async (embeds: any) => {
      this.fetchingAnimemeow = false;
      if (embeds.length > 0) {
        this.animemeowAvailable = true;
        this.animemeowEmbeds = embeds;
      }
    }).catch(async error => {
      this.fetchingAnimemeow = false;
      console.log(error);
    });
  }

  dismiss() {
    this.popoverCtrl.dismiss();
  }

  private async openFullVersionInfoModal() {
    const modal = await this.modalCtrl.create({
      component: FullVersionInfoPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    })
    modal.present();
  }

}
