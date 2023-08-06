import { Component, ElementRef, Input, KeyValueDiffers, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { IonInfiniteScroll, IonSearchbar } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { AdsService } from 'src/app/services/ads/ads.service';
import { ProvidersPopoverComponent } from 'src/app/components/providers-popover/providers-popover.component';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { environment } from 'src/environments/environment.prod';
import { Subscription } from 'rxjs';
import { WebVideoPlayerPage } from 'src/app/modals/web-video-player/web-video-player.page';
import { VideoPlayerService } from 'src/app/services/video-player/video-player.service';
import { AutoplayService } from 'src/app/services/autoplay/autoplay.service';
import { Domains } from 'src/app/components/embeds-popover/domains';

@Component({
  selector: 'app-episode',
  templateUrl: './episode.page.html',
  styleUrls: ['./episode.page.scss'],
})
export class EpisodePage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;
  @ViewChild('searchBar', { read: ElementRef }) searchBar: ElementRef;

  @Input() anime: any;
  @Input() totalEpisodes: number = 0;
  @Input() searchEp: number;
  public mediaUrl: string;
  public searchBarValue;
  public searchedEpisode: any[] = [];
  public currentEpisodes: number;
  public nextToSee: any = null;
  public objDiffer: any;
  public domain: string = environment.root_url;

  public checkingEpisodes: boolean;
  public isLogged: boolean = false;
  public user: PrivateUser;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = 'ultimos';

  @ViewChild('autoplayPopover') autoplayPopover;
  public isAutoplayPopoverOpened: boolean = false;
  public autoplay: boolean = false;

  private toggleSeenEpisodeSubscription: Subscription;
  private recentlySawVideoSubscription: Subscription;

  private videoDomains = new Domains;

  constructor(public database: MysqlDatabaseService, public modalCtrl: ModalController, public popoverCtrl: PopoverController, 
    public utils: UtilsService, public platform: Platform, public localStorage: PreferencesService, 
    public admob: AdsService, public differs:  KeyValueDiffers, public actionSheetCtrl: ActionSheetController, 
    private videoPlayerService: VideoPlayerService, private toastCtrl: ToastController, 
    private autoplayService: AutoplayService) {
    this.mediaUrl = this.database.animeMedia;
  }

  ngOnInit() {

    this.platform.ready().then(async () => {

      this.recentlySawVideoSubscription = this.videoPlayerService.recentlySawVideo$.subscribe(async (data) => {
        console.log("sub receltrysawvideo: ", data);

        if (data.episode.nextEpisode && this.autoplay) {
          this.autoplayAlgorithm(data.episode.nextEpisode);
        }
      });

      // setTimeout(() => {
      //   this.testAutoPlay();
      // }, 1000);

      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
        // if (!this.user.is_staff && !this.user.groups.moderator && !this.user.groups.vip) {
        //   this.admob.fireInterstitialAd();
        // }

        this.checkingEpisodes = true;
        this.anime.episodios.forEach(episode => {
          episode.seen = false;
        });

        this.database.checkSeenEpisodes(this.user.token, this.anime.id).then(data => {
          this.anime.episodios.forEach(episode => {
            data.forEach(seenEpisode => {
              if (episode.id == seenEpisode.episodio) {
                episode.seen = true;
                return;
              }
            });
          });
          this.totalEpisodes = this.anime.episodios.length;
          this.checkingEpisodes = false;
          if (this.searchEp != undefined) {
            this.search(this.searchEp);
          }

          this.anime.episodios.sort((a, b) => {
            return b.numero - a.numero;
          });
          this.searchedEpisode = this.anime.episodios;
          this.currentEpisodes = this.searchedEpisode.length;

          this.checkNextToSeeEpisode();

          this.objDiffer = {};
          this.anime.episodios.forEach((elt) => {
            this.objDiffer[elt] = this.differs.find(elt).create();
          });
          
          this.toggleSeenEpisodeSubscription = this.database.toggleSeenEpisode$.subscribe(() => {
            //hay que esperar 1 ms para que se actualice el episodio
            setTimeout(() => {
              this.checkNextToSeeEpisode();
            }, 1);
          });

        });
      } else {
        this.checkingEpisodes = false;
        if (this.searchEp != undefined) {
          this.search(this.searchEp);
        }

        this.anime.episodios.sort((a, b) => {
          return b.numero - a.numero;
        });
        this.searchedEpisode = this.anime.episodios
        this.currentEpisodes = this.searchedEpisode.length;
        // this.admob.fireInterstitialAd();
      }

      this.autoplay = await this.localStorage.getAutoplay(this.anime.id);

    });
  
  }

  ngOnDestroy() {
    if (this.toggleSeenEpisodeSubscription) {
      this.toggleSeenEpisodeSubscription.unsubscribe();
    }

    if (this.recentlySawVideoSubscription) {
      this.recentlySawVideoSubscription.unsubscribe();
    }
  }

  async checkNextToSeeEpisode() {
    let lastSeen = this.anime.episodios.filter((episode: { seen: boolean; }) => episode.seen === true
    ).sort((a, b) => {
      return b.numero - a.numero;
    })[0];
    
    if (lastSeen) {
      if (lastSeen.numero == this.totalEpisodes) {
        this.nextToSee = null;
      } else {
        if (this.anime.episodios.filter((episode: { seen: boolean; }) => episode.seen === false).length == 0) {
          this.nextToSee = null;
        } else {
          this.nextToSee = this.anime.episodios.filter(episode => episode.numero == lastSeen.numero + 1)[0];
        }
      }
    } else {
      this.nextToSee = this.anime.episodios.filter(episode => episode.numero == 1)[0];
    }
  }

  async toggleEpisode(episode: any) {
    const save_seen = episode.seen;
    episode.seen = null;
    await this.database.toggleSeenEpisode(this.user.token, episode.id).then((added) => {
      
      if (added) {
        episode.seen = true;
      } else {
        episode.seen = false;
      }

      Haptics.impact({ style: ImpactStyle.Light });
    }).catch(error => {
      episode.seen = save_seen;
      console.log(error);
    });
    // await loader.dismiss();
  }

  async openProviders(event, episode) {

    episode['anime'] = {
      id: this.anime.id,
      episodios: this.anime.episodios,
      nombre: this.anime.nombre,
      imagen: this.anime.imagen
    };
    
    if (!this.platform.is('capacitor')) {
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
    } else {
      const popover = await this.popoverCtrl.create({
        component: ProvidersPopoverComponent,
        cssClass: "custom-popover",
        event: event,
        componentProps: {
          episode: episode,
          animeImage: this.anime.imagen,
          animeName: this.anime.nombre
        }
      });
  
      await popover.present();
    }
  }

  async openProvidersDownload(episode) {

    if (!this.platform.is('capacitor')) {
      this.utils.showToast("No disponible en la web, descarga la aplicación", 1, false);
      return;
    }

    episode['anime'] = {
      episodios: this.anime.episodios
    };
    const popover = await this.popoverCtrl.create({
      component: ProvidersPopoverComponent,
      cssClass: "custom-popover",
      componentProps: {
        download: true,
        episode: episode,
        animeImage: this.anime.imagen,
        animeName: this.anime.nombre,
      }
    });

    await popover.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  search(numero) {
    this.searchBarValue = numero;
    if (numero.length > 0) {
      let position = this.anime.episodios.findIndex(episode => episode.numero == numero);
      console.log(position);
      if (position > -1) {
        this.viewPort.scrollToIndex(position);
      }
    }

  }

  loadMoreEpisodes(event) {
    if (this.searchedEpisode.length === this.anime.episodios.length) {
      event.target.disabled.true;
      this.disableInfiniteScroll();
    } else {
      this.searchedEpisode.push(...this.anime.episodios.slice(this.currentEpisodes, this.currentEpisodes + 20));
      this.currentEpisodes = this.searchedEpisode.length;
      event.target.complete();
    }
  }

  disableInfiniteScroll() {
    this.infiniteScroll.disabled = true;
  }

  enableInfiniteScroll() {
    this.infiniteScroll.disabled = false;
  }

  openComments(episode) {
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

  openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    
    if (sortName == 'ultimos') {
      console.log('ultimos');
      // this.anime.episodios.sort((a, b) => {
      //   return b.numero - a.numero;
      // });
      this.searchedEpisode = [...this.searchedEpisode.sort((a, b) => b.numero - a.numero)]
    } else if (sortName == 'antiguos') {
      console.log('antiguos');
      // this.anime.episodios.sort((a, b) => {
      //   return a.numero - b.numero;
      // });
      this.searchedEpisode = [...this.searchedEpisode.sort((a, b) => a.numero - b.numero)]
    }
    this.currentEpisodes = this.searchedEpisode.length;
  }

  randomEpisode() {
    let episode = this.anime.episodios[Math.floor(Math.random() * this.anime.episodios.length)];
    this.openProviders(null, episode);
  }

  randomEpisodeNotSeen() {
    let episode = null;
    episode = this.anime.episodios.filter((episode: { seen: boolean; }) => episode.seen === false)[Math.floor(Math.random() * this.anime.episodios.filter((episode: { seen: boolean; }) => episode.seen === false).length)];
    if (episode != null) {
      this.openProviders(null, episode);
      this.utils.showToast('Episodio aleatorio no visto', 1, false);
    } else {
      this.utils.showToast('No hay episodios no vistos', 1, false);
    }
  }

  async openEpisodeOptions(episode: any) {

    var buttons = [

    {
      text: 'Descargar',
      icon: 'cloud-download',
      handler: async () => {
        if (!this.platform.is('capacitor')) {
          this.utils.showToast("No disponible en la web, descarga la aplicación", 1, false);
          return;
        }
        this.openProvidersDownload(episode);
      }
    },
    {
      text: 'Ver Comentarios',
      icon: 'chatbubbles',
      handler: () => {
        this.openComments(episode);
      }
    },
    {
      text: 'Cerrar',
      role: 'cancel',
      icon: 'close'
    }];

    const actionSheet = await this.actionSheetCtrl.create({
      header: "Episodio " + episode.numero,
      subHeader: this.utils.dateAgo(episode.fecha),
      buttons: buttons
    });
    await actionSheet.present();
  }

  // ngDoCheck() {
  //   this.anime.episodios.forEach(elt => {
  //     try {
  //       var objDiffer = this.objDiffer[elt];
  //       var objChanges = objDiffer.diff(elt);

  //       if (objChanges) {
  //         objChanges.forEachChangedItem((elt) => {
  //           if (elt.key === 'seen' && elt.currentValue != null) {
  //             this.checkNextToSeeEpisode();
  //           }
  //         });
  //       }
  //     } catch (error) {}
  //   });
  // }

  openAutoplayPopover(e: Event) {
    this.autoplayPopover.event = e;
    this.isAutoplayPopoverOpened = true;
  }

  autoplaySet() {
    this.autoplay = !this.autoplay;
    if (this.autoplay) {
      this.localStorage.setAutoplay(this.anime.id, this.autoplay);
    } else {
      this.localStorage.removeAutoplay(this.anime.id);
    }
  }

  setTestAutoplayPreferences() {
    this.localStorage.setAutoplayPreferences(
      this.anime.id,
      "animemac",
      this.videoDomains.getYouruploadDomains(),
      "default"
    );
  }

  testAutoPlay() {
    this.anime.episodios[0].nextEpisode = this.anime.episodios[1];
    this.videoPlayerService.recentlySawVideo$.emit({
      episode: this.anime.episodios[0],
    });
  }

  async autoplayAlgorithm(nextEpisode: any) {
    let seconds = 10;

    let toast = await this.toastCtrl.create({
      message: `El siguiente episodio empezará en ${seconds} segundos`,
      icon: 'play',
      position: 'bottom',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            clearInterval(interval);
          }
        }
      ]
    });
    toast.present();

    const interval = setInterval(async () => {
      seconds--;
      toast.message = `El siguiente episodio empezará en ${seconds} segundos`;
      if (seconds === 0) {
        clearInterval(interval);
        toast.dismiss();
        console.log("Empieza la logica para abrir el video")

        const loader = await this.utils.createIonicLoader('Cargando episodio');
        loader.present();
        const autoplayPreferences = await this.localStorage.getAutoplayPreferences(this.anime.id);
        if (autoplayPreferences) {
          if (autoplayPreferences.providerName) {

            let embeds = [];
            // Se obtienen los embeds del proveedor preferido
            console.log(autoplayPreferences);
            await this.autoplayService.getEmbeds(nextEpisode, autoplayPreferences.providerName, this.anime.nombre, nextEpisode.numero).then((data: any) => {
              embeds = data;
            });

            // Si no hay embeds del proveedor preferido, se obtienen los embeds de alguno de los demas proveedores
            if (embeds.length == 0) {
              console.log("No hay embeds del proveedor preferido");
              await this.autoplayService.getEmbeds(nextEpisode, null, this.anime.nombre, nextEpisode.numero).then((data: any) => {
                embeds = data;
              });
            }

            loader.dismiss();
            // Si no hay embeds de ningun proveedor, se muestra un toast y se cancela el autoplay
            if (embeds.length === 0) {
              this.utils.showToast("No se encontraron videos para el próximo episodio", 1, false);
              return;
            } else {
              console.log(embeds);

              const videoDomainsNames = autoplayPreferences.videoProviderDomains;
              // Se filtran los embeds por los dominios preferidos
              let selectedEmbed = embeds.filter((embed) => {
                for (let videoDomain of videoDomainsNames) {
                  if (embed.url.includes(videoDomain)) {
                    return embed;
                  }
                }
              });

              if (selectedEmbed.length == 0) {
                //selecciona el primer embed
                selectedEmbed = embeds[0];
              }

              this.autoplayService.getVideos(selectedEmbed).then(async (data: any) => {
                
                const videos: any = data;
                const videosLength = videos.filter(video => video.kind == "video").length;

                for (let ep of this.anime.episodios) {
                  if (ep.numero == nextEpisode.numero + 1) {
                    nextEpisode['nextEpisode'] = ep;
                    break;
                  }
                }

                if (videosLength == 0) {
                  this.utils.showToast("No se encontraron videos automáticamente, seleccionalo manualmente por favor", 1, false);
                } else if (videosLength > 1) {
                  this.autoplayService.openVideoPopover(event, videos, selectedEmbed[0].embed, videoDomainsNames, nextEpisode, this.anime.nombre, 
                    this.anime.imagen, autoplayPreferences.providerName);
                } else {
                  const captions = videos.filter(video => video.kind == "captions");
                  let caption = "";
                  if (captions.length > 0) {
                    caption = captions[0].file;
                  }

                  const settings = await this.localStorage.getSettings();
                  const deserveAd = await this.localStorage.getDeserveAd();
                  this.autoplayService.openSingleVideo(videos[0], caption, videoDomainsNames, this.user, nextEpisode, deserveAd, this.anime.nombre, 
                    this.anime.imagen, this.isLogged, settings, autoplayPreferences.providerName);
                }
                
              }).catch(error => {
                console.log(error);
                this.utils.showToast("No se encontraron videos automáticamente, seleccionalo manualmente por favor", 1, false);
              });
            }

          }
        } else {
          loader.dismiss();
          this.utils.showToast("No hay una configuración preferida para autoplay", 2, false);
        }
      }
    }, 1000);
  }
}
