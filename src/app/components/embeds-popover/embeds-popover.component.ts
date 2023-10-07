import { Component, Input, OnInit } from '@angular/core';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { AdsService } from 'src/app/services/ads/ads.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { ResolversService } from 'src/app/services/resolvers/resolvers.service';
import { VideoPlayerService } from 'src/app/services/video-player/video-player.service';
import { Browser, OpenOptions } from '@capacitor/browser';
import { VideosPopoverComponent } from '../videos-popover/videos-popover.component';
import { DownloadService } from 'src/app/services/download/download.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Domains } from './domains';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { Settings } from 'src/app/interfaces/settings';
import { Subscription } from 'rxjs';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';

@Component({
  selector: 'app-embeds-popover',
  templateUrl: './embeds-popover.component.html',
  styleUrls: ['./embeds-popover.component.scss'],
})
export class EmbedsPopoverComponent implements OnInit {

  @Input() download: boolean;
  @Input() episode: any;
  @Input() embeds: any;
  @Input() providerName: string;
  @Input() embedRequested: boolean;
  @Input() animeImage: string;
  @Input() animeName: string;

  public localCompatible: any = [];
  public webCompatible: any = [];
  public optionValue;

  public deserveAd: boolean = true;

  public settings: Settings;

  public isLogged: boolean = false;
  public user: PrivateUser;

  private videoDomains = new Domains;

  public buttonsClickable: boolean = false;

  public loader: HTMLIonLoadingElement;
  private loaderText: string = "Cargando...";

  private videoPlaybackStartedSubscription: Subscription;

  constructor(
    public resolvers: ResolversService,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public players: VideoPlayerService,
    public ads: AdsService,
    public localStorage: PreferencesService,
    public platform: Platform,
    public downloadService: DownloadService,
    public utils: UtilsService,
    private database: MysqlDatabaseService,
    private sharingService: SharingService
  ) {

  }

  async ngOnInit() {

    if (!this.embedRequested) {
      this.localCompatible = this.embeds.filter(embed => 
        // embed.url.includes('fembed') || 
        // embed.url.includes('embedsito') || 
        this.videoDomains.getOkruDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getUqloadDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getYouruploadDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getMailruDomains().some(domain => embed.url.includes(domain)) ||
        // embed.url.includes('animefenix') ||
        this.videoDomains.getAnimeuiDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getStreamtapeDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getJwplayerDomains().some(domain => embed.url.includes(domain)) ||
        (embed.url.includes('.mp4') && !this.videoDomains.getBurstcloudDomains().some(domain => embed.url.includes(domain))) ||
        this.videoDomains.getIronhentaiDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getAnimepelixDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getStreamhideDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getStreamwishDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getFireloadDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getSendvidDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getMixdropDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getIpfsDomains().some(domain => embed.url.includes(domain)) || 
        this.videoDomains.getVoeDomains().some(domain => embed.url.includes(domain)) ||
        this.videoDomains.getStreamhubDomains().some(domain => embed.url.includes(domain))
        // this.videoDomains.getStreamsbDomains().some(domain => embed.url.includes(domain))
      );

      this.webCompatible = this.embeds.filter(embed => 
        // !embed.url.includes('fembed') && 
        // !embed.url.includes('embedsito') && 
        !this.videoDomains.getOkruDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getUqloadDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getYouruploadDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getMailruDomains().some(domain => embed.url.includes(domain)) &&
        // !embed.url.includes('animefenix') &&
        !this.videoDomains.getAnimeuiDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getStreamtapeDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getJwplayerDomains().some(domain => embed.url.includes(domain)) &&
        (!embed.url.includes('.mp4') || this.videoDomains.getBurstcloudDomains().some(domain => embed.url.includes(domain))) &&
        !this.videoDomains.getIronhentaiDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getAnimepelixDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getStreamhideDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getStreamwishDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getFireloadDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getSendvidDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getMixdropDomains().some(domain => embed.url.includes(domain)) &&
        !this.videoDomains.getIpfsDomains().some(domain => embed.url.includes(domain)) && 
        !this.videoDomains.getVoeDomains().some(domain => embed.url.includes(domain)) && 
        !this.videoDomains.getStreamhubDomains().some(domain => embed.url.includes(domain))
        // !this.videoDomains.getStreamsbDomains().some(domain => embed.url.includes(domain))
      );

      this.optionValue = 'local';
      this.platform.ready().then(async () => {
        this.isLogged = await this.localStorage.getLogged();
        if (this.isLogged) {
          this.user = await this.localStorage.getUser();
        }

        if (!this.episode.anime.episodios) {
          await this.database.getAnimeDetail(this.episode.anime.id, this.user.token).then(async (res: any) => {
            this.episode.anime.episodios = res.episodios;
            this.buttonsClickable = true;
          });
        } else {
          this.buttonsClickable = true;
        }
        // se obtiene el episodio siguiente
        for (let ep of this.episode.anime.episodios) {
          if (ep.numero == this.episode.numero + 1) {
            this.episode['nextEpisode'] = ep;
          }
        }

        this.deserveAd = await this.localStorage.getDeserveAd();
        this.settings = await this.localStorage.getSettings();
      });

      this.videoPlaybackStartedSubscription = this.sharingService.getVideoPlaybackStarted().subscribe((started) => {
        if (started) {
          this.popoverCtrl.dismiss({openedVideo: true});
        }
      });

    } else {
      this.webCompatible = this.embeds;
      this.optionValue = 'web';
      this.buttonsClickable = true;
    }
  }

  ngOnDestroy() {
    if (this.videoPlaybackStartedSubscription) {
      this.videoPlaybackStartedSubscription.unsubscribe();
    }
  }

  segmentChanged(event: any) {
    if (event.detail.value != '') {
      this.optionValue = event.detail.value;
    }
  }

  async openSingleVideo(video: any, subtitleUrl: string, videoProviderDomains: string[]) {

    const isDownloading = await this.localStorage.getIsDownloading();
    if (this.download) {
      if (isDownloading) {
        this.utils.showToast("Hay una descarga en curso, no puedes ni descargar ni reproducir otro video", 2, false);
      } else {
        this.downloadService.downloadVideo(this.episode, video);
      }
      this.loader.dismiss();
      return;
    } else {
      if (isDownloading) {
        this.utils.showToast("Hay una descarga en curso, no puedes ni descargar ni reproducir otro video", 2, false);
        this.loader.dismiss();
        return;
      }
    }

    if (this.user) {
      if (!this.user.is_staff && !this.user.groups.vip && !this.user.groups.moderator) {

        if (this.deserveAd) {

          // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
          //   this.popoverCtrl.dismiss({openedVideo: true});
          //   this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
          // }).catch((error) => {
          //   if (!error.cancelled) {
          //     this.popoverCtrl.dismiss({openedVideo: true});
          //     this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
          //   }
          // });
        } else {
          this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage,
           this.episode, this.isLogged, this.user, this.settings, this.providerName.toLocaleLowerCase(), videoProviderDomains, "default", this.loader);
        }
  
      } else {
        this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage,
         this.episode, this.isLogged, this.user, this.settings, this.providerName.toLocaleLowerCase(), videoProviderDomains, "default", this.loader);
      }

    } else {
      if (this.deserveAd) {
        // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
        //   this.popoverCtrl.dismiss({openedVideo: true});
        //   this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
        // }).catch((error) => {
        //   if (!error.cancelled) {
        //     this.popoverCtrl.dismiss({openedVideo: true});
        //     this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
        //   }
        // });
      } else {
        this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage,
         this.episode, this.isLogged, this.user, this.settings, this.providerName.toLocaleLowerCase(), videoProviderDomains, "default", this.loader);
      }
    }
  }

  async getVideos(event, embed: any, compatible: string) {

    if (this.embedRequested) {
      this.popoverCtrl.dismiss({
        embedReady: true,
        embedUrl: embed.url,
        embedName: embed.embed,
      });
    } else {

      if (compatible === 'web') {
        const alert = await this.alertCtrl.create({
          header: 'Esta fuente no soporta la reproducción local',
          message: 'Solo puedes abrirlo en tu navegador, es posible que hayan anuncios.',
          mode: 'ios',
          translucent: true,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary'
            }, {
              text: 'Abrir',
              handler: () => {
                // window.open(embed.url, '_system', 'location=yes');
                const openOptions: OpenOptions = {
                  url: embed.url,
                  presentationStyle: 'popover',
                }
                Browser.open(openOptions);
              }
            }
          ]
        });
        alert.present();

      } else if (compatible === 'local') {
    
        this.loader = await this.utils.createIonicLoader(this.loaderText);
        this.loader.present();

        if (this.videoDomains.getOkruDomains().some(domain => embed.url.includes(domain))) {
        
          await this.resolvers.okruResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getOkruDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getOkruDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
          //Murio Fembed :(
    
        // } else if (embed.url.includes('fembed') || embed.url.includes('embedsito')) {
        //   await this.resolvers.fembedResolver(embed.url).then(async data => {
        //     const videos: any = data;
        //     if (videos.length > 1) {
        //       const popover = await this.popoverCtrl.create({
        //         component: VideosPopoverComponent,
        //         cssClass: "custom-popover",
        //         event: event,
        //         componentProps: {
        //           download: this.download,
        //           videos: videos,
        //           episode: this.episode,
        //           title: this.animeName,
        //           smallTitle: "Episodio " + this.episode.numero,
        //           image: this.animeImage,
        //           embedName: embed.embed
        //         }
        //       });
        //       await popover.present();
        //       await popover.onDidDismiss().then(data => {
        //         if (data.data) {
        //           if (data.data.openedVideo) {
        //             this.popoverCtrl.dismiss({openedVideo: true});
        //           }
        //         }
        //       });
        //     } else {
        //       this.openSingleVideo(videos[0], "");
        //     }
      
        //   }, async error => {
        //     console.log(error);
        //     const alert = await this.alertCtrl.create({
        //       header: 'No se pudieron obtener los videos',
        //       message: 'Hubo un error al obtener los videos. ¿Deseas abrirlos en tu navegador?',
        //       mode: 'ios',
        //       translucent: true,
        //       buttons: [
        //         {
        //           text: 'Cancelar',
        //           role: 'cancel',
        //           cssClass: 'secondary'
        //         }, {
        //           text: 'Abrir',
        //           handler: () => {
        //             //window.open(embed.url, '_system', 'location=yes');
        //             Browser.open({ url: embed.url });
        //           }
        //         }
        //       ]
        //     });
        //     await alert.present();
        //   });
    
        } else if (this.videoDomains.getUqloadDomains().some(domain => embed.url.includes(domain))) {
          await this.resolvers.uqloadResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getUqloadDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getUqloadDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getYouruploadDomains().some(domain => embed.url.includes(domain))) {
          await this.resolvers.youruploadResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getYouruploadDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getYouruploadDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getMailruDomains().some(domain => embed.url.includes(domain))) {
          await this.resolvers.mailRuResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getMailruDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getMailruDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (embed.url.includes('animefenix')) {
    
          await this.resolvers.aFenixResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, ['animefenix']);
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, ['animefenix']);
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getAnimeuiDomains().some(d => embed.url.includes(d)) && !this.videoDomains.getIpfsDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.animeuiResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getAnimeuiDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getAnimeuiDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getStreamtapeDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.streamtapeResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getStreamtapeDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getStreamtapeDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getJwplayerDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.jwplayerResolver(embed.url).then(async data => {
            const videos: any = data;
    
            const videosLength = videos.filter(video => video.kind == "video").length;
    
            if (videosLength > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getJwplayerDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getJwplayerDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getIronhentaiDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.ironhentaiResolver(embed.url).then(async data => {
            const videos: any = data;
    
            const videosLength = videos.filter(video => video.kind == "video").length;
    
            if (videosLength > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getIronhentaiDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getIronhentaiDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getAnimepelixDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.animepelixResolver(embed.url).then(async data => {
            const videos: any = data;
    
            const videosLength = videos.filter(video => video.kind == "video").length;
    
            if (videosLength > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getAnimepelixDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getAnimepelixDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
      
        // } else if (this.videoDomains.getStreamsbDomains().some(d => embed.url.includes(d))) {
    
        //   await this.resolvers.streamsbResolver(embed.url).then(async data => {
        //     const videos: any = data;
    
        //     const videosLength = videos.filter(video => video.kind == "video").length;
    
        //     if (videosLength > 1) {
        //       this.openVideoPopover(event, videos, embed.embed);
        //     } else {
        //       const captions = videos.filter(video => video.kind == "captions");
        //       let caption = "";
        //       if (captions.length > 0) {
        //         caption = captions[0].file;
        //       }
        //       this.openSingleVideo(videos[0], caption);
        //     }
        //   }, () => {
        //     this.openAlert(embed.url);
        //   });
    
        } else if (this.videoDomains.getMp4uploadDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.mp4uploadResolver(embed.url).then(async data => {
            const videos: any = data;
    
            const videosLength = videos.filter(video => video.kind == "video").length;
    
            if (videosLength > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getMp4uploadDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getMp4uploadDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getStreamhideDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.streamhideResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getStreamhideDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getStreamhideDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });

        } else if (this.videoDomains.getStreamwishDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.streamhideResolverOld(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getStreamwishDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getStreamwishDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getSendvidDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.sendvidResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getSendvidDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getSendvidDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getMixdropDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.mixdropResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getMixdropDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getMixdropDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (this.videoDomains.getVoeDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.voeResolver(embed.url).then(async data => {
            const videos: any = data;
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getVoeDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getVoeDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });

        } else if (this.videoDomains.getStreamhubDomains().some(d => embed.url.includes(d))) {
    
          await this.resolvers.streamhubResolver(embed.url).then(async data => {
            const videos: any = data;
    
            if (videos.length > 1) {
              this.openVideoPopover(event, videos, embed.embed, this.videoDomains.getStreamhubDomains());
            } else {
              const captions = videos.filter(video => video.kind == "captions");
              let caption = "";
              if (captions.length > 0) {
                caption = captions[0].file;
              }
              this.openSingleVideo(videos[0], caption, this.videoDomains.getStreamhubDomains());
            }
          }, () => {
            this.openAlert(embed.url);
          });
    
        } else if (((embed.url.includes('.mp4') || this.videoDomains.getFireloadDomains().some(d => embed.url.includes(d))) && (!this.videoDomains.getMp4uploadDomains().some(d => embed.url.includes(d)) && !this.videoDomains.getBurstcloudDomains().some(d => embed.url.includes(d)))) || this.videoDomains.getIpfsDomains().some(d => embed.url.includes(d))) {
          const video = {
            file: embed.url,
            headers: {
              Referer: embed.url
            }
          }

          let videoDomains = [];
          if (this.videoDomains.getFireloadDomains().some(d => embed.url.includes(d))) {
            videoDomains = this.videoDomains.getFireloadDomains();
          } else if (this.videoDomains.getIpfsDomains().some(d => embed.url.includes(d))) {
            videoDomains = this.videoDomains.getIpfsDomains();
          } else {
            videoDomains = ['.mp4'];
          }

          this.openSingleVideo(video, "", videoDomains);
    
        }
      }
    }
  }

  dismiss() {
    this.popoverCtrl.dismiss();
  }

  async openVideoPopover(event: any, videos: any, embedName: string, videoProviderDomains: string[]) {
    this.loader.dismiss();
    this.videoPlaybackStartedSubscription.unsubscribe();
    const popover = await this.popoverCtrl.create({
      component: VideosPopoverComponent,
      event: event,
      componentProps: {
        download: this.download,
        videos: videos,
        episode: this.episode,
        title: this.animeName,
        smallTitle: "Episodio " + this.episode.numero,
        image: this.animeImage,
        embedName: embedName,
        providerName: this.providerName.toLocaleLowerCase(),
        videoProviderDomains: videoProviderDomains,
        loader: this.loader
      }
    });
    await popover.present();
    await popover.onDidDismiss().then(data => {
      if (data.data) {
        if (data.data.openedVideo) {
          this.popoverCtrl.dismiss({openedVideo: true});
        }
      }
    });
  }

  async openAlert(embedUrl: string) {
    this.loader.dismiss();
    const alert = await this.alertCtrl.create({
      header: 'No se pudieron obtener los videos',
      message: 'Hubo un error al obtener los videos. ¿Deseas abrirlos en tu navegador?',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Abrir',
          handler: () => {
            const openOptions: OpenOptions = {
              url: embedUrl,
              presentationStyle: 'popover',
            }
            Browser.open(openOptions);
          }
        }
      ]
    });
    await alert.present();
  }

}
