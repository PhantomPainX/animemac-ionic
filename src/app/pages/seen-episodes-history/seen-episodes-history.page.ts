import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInfiniteScroll, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ProvidersPopoverComponent } from 'src/app/components/providers-popover/providers-popover.component';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { EpisodePage } from '../episode/episode.page';
import { WebVideoPlayerPage } from 'src/app/modals/web-video-player/web-video-player.page';
import { VideoPlayerService } from 'src/app/services/video-player/video-player.service';
import { Subscription } from 'rxjs';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';

@Component({
  selector: 'app-seen-episodes-history',
  templateUrl: './seen-episodes-history.page.html',
  styleUrls: ['./seen-episodes-history.page.scss'],
})
export class SeenEpisodesHistoryPage implements OnInit {

  @ViewChild(IonInfiniteScroll) public infiniteScroll: IonInfiniteScroll;
  @ViewChild('toolbar', { read: ElementRef }) public toolbar: ElementRef;
  @ViewChild('sortPopover') public sortPopover: any;
  public isSortPopoverOpened: boolean = false;

  public domain: string = environment.root_url;
  public results: any;
  private pagination: any;
  private isLogged: boolean = false;
  private token: string = "";

  public totalResults: number = 0;
  public noResults: boolean = false;
  public loading: boolean = true;
  public sortName: string = '-updated_at';

  private episodeTimeSeenChangedSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private database: MysqlDatabaseService,
    private popoverCtrl: PopoverController,
    public utils: UtilsService,
    private actionSheetCtrl: ActionSheetController,
    private platform: Platform,
    private navCtrl: NavController,
    private localStorage: PreferencesService,
    private videoPlayerService: VideoPlayerService,
    public zone: NgZone,
    private sharingService: SharingService
  ) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        const user = await this.localStorage.getUser();
        this.token = user.token;

        this.episodeTimeSeenChangedSubscription = this.sharingService.getEpisodeTimeSeen().subscribe(async () => {
          this.getResults(this.sortName);
        });
      } else {
        this.navCtrl.navigateRoot('/signin');
      }

      await this.getResults(this.sortName);
      this.loading = false;
    });
  }

  ngOnDestroy() {
    // if (this.episodeTimeSeenChangedSubscription) {
    //   this.episodeTimeSeenChangedSubscription.unsubscribe();
    // }
  }

  private async getResults(ordering: string) : Promise<void> {

    await this.database.getSeenEpisodesHistory(1, ordering, this.token).then(data => {
      this.results = data.results;
      this.totalResults = data.count;
      this.pagination = {
        'actualPage': 1,
        'hasNextPage': data.next != null,
      }
    }); // no hay catch porque los errores se controlan en el servicio

    if (this.results.length == 0) {
      this.noResults = true;
      //this.infiniteScroll.disabled = true;
    }
  }

  public loadMoreResults(event) {
    if (this.pagination.hasNextPage) {

      this.database.getSeenEpisodesHistory(this.pagination.actualPage + 1, this.sortName, this.token).then(data => {
        this.results = this.results.concat(data.results);
        this.pagination = {
          'actualPage': this.pagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }); // no hay catch porque los errores se controlan en el servicio

    } else {
      event.target.complete();
      this.infiniteScroll.disabled = true;
    }
  }

  public async goToAnimeDetail(anime: any) {
    this.navCtrl.navigateForward('/detail/'+anime.id);
  }

  public async openProviders(event, episode) {

    if (!this.platform.is('capacitor')) {

      const loader = await this.utils.createIonicLoader("Cargando reproductor...");
      await loader.present();
      this.database.getAnimeDetail(episode.episode_data.anime.id, this.token).then(async anime => {
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

  public close() {
    this.navCtrl.back();
  }

  public async toggleRefresh(event) {
    await this.getResults(this.sortName);
    event.target.complete();
  }


  // Opciones Extras

  private async toggleFavorite(anime: any) {
    const loader = await this.utils.createLoaderToast("Espera un momento...", "sync");
    await loader.present();

    await this.database.toggleFavoriteAnime(this.token, anime.id).then((added) => {

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

    await this.database.toggleSeenEpisode(this.token, episode.id).then((added) => {

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

  private async openEpisodesModal(anime: any) {
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

    console.log(episode);
    const actionSheet = await this.actionSheetCtrl.create({
      header: episode.episode_data.anime.nombre,
      buttons: buttons
    });
    await actionSheet.present();
  }

  public openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  public sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    this.results = null;
    this.getResults(sortName);
  }

}
