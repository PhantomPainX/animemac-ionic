import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInfiniteScroll, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { EpisodePage } from '../episode/episode.page';
import { UtilsService } from 'src/app/services/utils.service';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { environment } from 'src/environments/environment.prod';
import { ProvidersPopoverComponent } from 'src/app/components/providers-popover/providers-popover.component';
import { WebVideoPlayerPage } from 'src/app/modals/web-video-player/web-video-player.page';
import { Subscription } from 'rxjs';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit {

  // Variables generales
  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;
  @ViewChild('sortPopover') public sortPopover: any;
  public isLogged: boolean = false;
  public user: PrivateUser;
  public domain: string = environment.root_url;
  public fetching: boolean = false;
  public segmentValue: string = 'favorites';
  public sortName: string = '-updated_at';
  public isSortPopoverOpened: boolean = false;

  // Variables para favoritos
  @ViewChild('favInfiniteScroll') favInfiniteScroll: IonInfiniteScroll;
  @ViewChild('favVirtualScroll', { read: ElementRef }) favVirtualScroll: ElementRef;
  public results: any[] = [];
  public favoritesPagination: any;
  public noFavAvailable: boolean = false;

  // Variables para historial
  @ViewChild('historyInfiniteScroll') public historyInfiniteScroll: IonInfiniteScroll;
  public historyResults: any;
  public totalHistoryResults: number = 0;
  public noHistoryResults: boolean = false;
  public historyPagination: any;
  private episodeTimeSeenChangedSubscription: Subscription;

  constructor(public database: MysqlDatabaseService, public modalCtrl: ModalController, 
    public actionSheetCtrl: ActionSheetController, public utils: UtilsService, public platform: Platform, 
    public navCtrl: NavController, public localStorage: PreferencesService,
    private popoverCtrl: PopoverController, private sharingService: SharingService) {
  }

  ngOnInit() {

    setTimeout(() => {
      this.favInfiniteScroll.disabled = true;
    }, 1);

    this.platform.ready().then(async () => {

      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
      }

      this.fetching = true;
      this.database.getFavoriteAnimes(this.user.token, 1).then(data => {
        this.fetching = false;
        this.results = data.results;

        if (this.results.length == 0) {
          this.favInfiniteScroll.disabled = true;
          this.noFavAvailable = true;
        } else {
          this.favoritesPagination = {
            'actualPage': 1,
            'hasNextPage': data.next != null
          }
          this.favInfiniteScroll.disabled = false;
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.episodeTimeSeenChangedSubscription) {
      this.episodeTimeSeenChangedSubscription.unsubscribe();
    }
  }

  // Metodos generales

  async goToAnimeDetail(anime: any) {
    this.navCtrl.navigateForward('/detail/'+anime.id);
  }

  async toggleRefresh(event) {
    if (this.segmentValue === 'favorites') {
      this.noFavAvailable = false;
      await this.updateFavorites();
    } else if (this.segmentValue === 'history') {
      await this.getHistoryResults(this.sortName);
    }

    event.target.complete();
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

    var buttons = [{
      text: 'Ver Detalle',
      icon: 'information-circle',
      handler: () => {
        this.goToAnimeDetail(anime);
      }
    }, {
      text: 'Episodios',
      icon: 'play',
      handler: () => {
        this.openEpisodesModal(anime);
      }
    }, {
      text: 'Cerrar',
      role: 'cancel',
      icon: 'close'
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
    }];
    
    if (this.isLogged) {
      buttons.push({
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

  public segmentChanged(event) {
    this.segmentValue = event.detail.value;

    if (this.episodeTimeSeenChangedSubscription) {
      this.episodeTimeSeenChangedSubscription.unsubscribe();
    }
    
    if (this.segmentValue === 'history') {
      this.episodeTimeSeenChangedSubscription = this.sharingService.getEpisodeTimeSeen().subscribe(async () => {
        this.getHistoryResults(this.sortName);
      });
      
      if (this.historyResults == undefined) {
        this.getHistoryResults(this.sortName);
      }

    } else if (this.segmentValue === 'favorites') {
      if (this.results.length == 0 && !this.noFavAvailable) {
        this.fetching = true;
        this.database.getFavoriteAnimes(this.user.token, 1).then(data => {
          this.fetching = false;
          this.results = data.results;

          if (this.results.length == 0) {
            this.favInfiniteScroll.disabled = true;
            this.noFavAvailable = true;
          } else {
            this.favoritesPagination = {
              'actualPage': 1,
              'hasNextPage': data.next != null
            }
            this.favInfiniteScroll.disabled = false;
          }
        });
      } else {
        setTimeout(() => {
          this.favInfiniteScroll.disabled = true;
        }, 1);
      }
    }
  }

  public openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  public sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    
    if (this.segmentValue === 'history') {
      this.historyResults = null;
      this.getHistoryResults(sortName);
    }
  }

  // Metodos para favoritos

  async updateFavorites() {
    this.favInfiniteScroll.disabled = true;
    this.noFavAvailable = false;
    this.fetching = true;
    await this.database.getFavoriteAnimes(this.user.token, 1).then(data => {
      this.fetching = false;
      this.results = data.results;

      if (this.results.length == 0) {
        this.noFavAvailable = true;
        this.favInfiniteScroll.disabled = true;
      } else {
        this.favoritesPagination = {
          'actualPage': 1,
          'hasNextPage': data.next != null
        }
        this.favInfiniteScroll.disabled = false;
      }
    });
  }

  async loadMoreFavorites(event) {
    if (this.favoritesPagination.hasNextPage) {

      await this.database.getFavoriteAnimes(this.user.token, this.favoritesPagination.actualPage + 1).then(data => {
        this.results = this.results.concat(data.results);
        this.favoritesPagination = {
          'actualPage': this.favoritesPagination.actualPage + 1,
          'hasNextPage': data.next != null
        }

        event.target.complete();
      }, error => {
        console.log(error);
        // const interval = setInterval(() => {
        //   this.obtainLatestsEpisodes(this.episodesPagination.actualPage + 1).then(() => {
        //     clearInterval(interval);
        //   });
        // }, 3000);
      });
      
    } else {
      event.target.complete();
      this.favInfiniteScroll.disabled = true;
    }
  }

  // Opciones Extras

  async deleteFavorite(anime: any, index: number, slidingItem: any) {
    this.database.toggleFavoriteAnime(this.user.token, anime.id);
    this.results.splice(index, 1);
    slidingItem.close();
  }


  // History methods

  public async openEpisodeOptions(episode: any) {

    var buttons = [{
      text: 'Ver Detalle',
      icon: 'information-circle',
      handler: () => {
        this.goToAnimeDetail(episode.episode_data.anime);
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
        const popover = await this.popoverCtrl.create({
          component: ProvidersPopoverComponent,
          cssClass: "custom-popover",
          componentProps: {
            download: true,
            episode: episode.episode_data,
            animeImage: episode.episode_data.anime.imagen,
            animeName: episode.episode_data.anime.nombre
          }
        });
    
        popover.present();
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
            episode: episode.episode_data,
            commentsType: 'episode'
          }
        }).then(modal => {
          modal.present();
        });
      }
    }, {
      text: 'Cerrar',
      role: 'cancel',
      icon: 'close'
    }];


    if (this.isLogged) {
      buttons.push({
        text: 'Añadir / Eliminar de favoritos',
        icon: 'heart',
        handler: () => {
          this.toggleFavorite(episode.episode_data.anime);
        }
      }, {
        text: 'Marcar como visto / No visto',
        icon: 'eye',
        handler: () => {
          this.toggleEpisode(episode.episode_data);
        }
      }, {
        text: 'Cerrar',
        role: 'cancel',
        icon: 'close'
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: episode.episode_data.anime.nombre,
      buttons: buttons
    });
    await actionSheet.present();
  }

  private async toggleFavorite(anime: any) {
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

  private async toggleEpisode(episode: any) {
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

  public async openProviders(event, episode) {

    if (!this.platform.is('capacitor')) {

      const loader = await this.utils.createIonicLoader("Cargando reproductor...");
      await loader.present();
      this.database.getAnimeDetail(episode.episode_data.anime.id, this.user.token).then(async anime => {
        await loader.dismiss();
        episode.episode_data.anime = anime;
        const modal = await this.modalCtrl.create({
          component: WebVideoPlayerPage,
          cssClass: 'rounded-modal',
          breakpoints: [0, 1],
          initialBreakpoint: 1,
          // canDismiss: false,
          componentProps: {
            episode: episode.episode_data
          }
        })
        modal.present();
      }).catch(async () => {
        await loader.dismiss();
        this.utils.showToast("Ha ocurrido un error, intenta más tarde", 2, false);
      });
    } else {
      const popover = await this.popoverCtrl.create({
        component: ProvidersPopoverComponent,
        cssClass: "custom-popover",
        event: event,
        componentProps: {
          episode: episode.episode_data,
          animeImage: episode.episode_data.anime.imagen,
          animeName: episode.episode_data.anime.nombre
        }
      });
  
      await popover.present();
    }
  }

  public loadMoreHistoryResults(event) {
    if (this.historyPagination.hasNextPage) {

      this.database.getSeenEpisodesHistory(this.historyPagination.actualPage + 1, this.sortName, this.user.token).then(data => {

        for (let episode of data.results) {
          if (episode.seconds != 0) {
            episode.progress = episode.seconds / episode.total_seconds;
          }
        }

        this.historyResults = this.historyResults.concat(data.results);
        this.historyPagination = {
          'actualPage': this.historyPagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }); // no hay catch porque los errores se controlan en el servicio

    } else {
      event.target.complete();
      this.historyInfiniteScroll.disabled = true;
    }
  }

  private async getHistoryResults(ordering: string) : Promise<void> {

    this.fetching = true;
    await this.database.getSeenEpisodesHistory(1, ordering, this.user.token).then(data => {
      this.historyResults = data.results;
      this.fetching = false;

      for (let episode of this.historyResults) {
        if (episode.seconds != 0) {
          episode.progress = episode.seconds / episode.total_seconds;
        }
      }
      this.totalHistoryResults = data.count;
      this.historyPagination = {
        'actualPage': 1,
        'hasNextPage': data.next != null,
      }
    }); // no hay catch porque los errores se controlan en el servicio

    if (this.historyResults.length == 0) {
      this.noHistoryResults = true;
      setTimeout(() => {
        this.historyInfiniteScroll.disabled = true;
      }, 1);
    } else {
      setTimeout(() => {
        this.historyInfiniteScroll.disabled = false;
      }, 1);
      this.noHistoryResults = false;
    }
  }
}
