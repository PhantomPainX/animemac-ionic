import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonInfiniteScroll, IonModal, ItemReorderEventDetail, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
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
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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

  public presentingElement = null;

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
  private sortHistoryBackup: string = "";

  // Variables para listas
  @ViewChild('listsInfiniteScroll') public listsInfiniteScroll: IonInfiniteScroll;
  @ViewChild('modalCreateList') public modalCreateList: IonModal;
  public listsResults: any;
  public noListsResults: boolean = false;
  private listsPagination: any;
  private sortListsBackup: string = "";
  private listsCreateModalAction: number = 1; // 1: Crear, 2: Editar
  private editListActiveObj: any;
  public dinamicListCreateModalTitle: string = "Crear lista";
  public dinamicListCreateModalButton: string = "Crear";
  public listsReorderDisabled: boolean = true;

  public formList: FormGroup;

  constructor(public database: MysqlDatabaseService, public modalCtrl: ModalController, 
    public actionSheetCtrl: ActionSheetController, public utils: UtilsService, public platform: Platform, 
    public navCtrl: NavController, public localStorage: PreferencesService,
    private popoverCtrl: PopoverController, private sharingService: SharingService, 
    public formBuilder: FormBuilder, private alertCtrl: AlertController) {

      this.formList = this.formBuilder.group({
        name: ['', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(128),
          Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ0-9 ]*$/)
        ]],
        description: ['', [
          Validators.maxLength(65535),
          Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$/)
        ]]
      });
  }

  ngOnInit() {

    setTimeout(() => {
      this.favInfiniteScroll.disabled = true;
    }, 1);

    this.presentingElement = document.querySelector('ion-router-outlet');

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
    } else if (this.segmentValue === 'lists') {
      await this.getUserLists(this.sortName);
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
      this.sortName = this.sortHistoryBackup == "" ? '-updated_at' : this.sortHistoryBackup;
      this.episodeTimeSeenChangedSubscription = this.sharingService.getEpisodeTimeSeen().subscribe(async () => {
        this.getHistoryResults(this.sortName);
      });
      
      if (this.historyResults == undefined) {
        setTimeout(() => {
          this.historyInfiniteScroll.disabled = true;
        }, 1);
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
    } else if (this.segmentValue === 'lists') {
      this.listsReorderDisabled = true;
      this.sortName = this.sortListsBackup == "" ? '-order' : this.sortListsBackup;
      if (this.listsResults == undefined) {
        setTimeout(() => {
          this.listsInfiniteScroll.disabled = true;
        }, 1);
        this.getUserLists(this.sortName);
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
      this.historyInfiniteScroll.disabled = true;
      this.historyResults = null;
      this.sortHistoryBackup = sortName;
      this.getHistoryResults(sortName);
    } else if (this.segmentValue === 'lists') {
      this.listsResults = null;
      this.listsInfiniteScroll.disabled = true;
      this.sortListsBackup = sortName;
      this.getUserLists(sortName);
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

    if (this.results.length == 0) {
      this.noFavAvailable = true;
      this.favInfiniteScroll.disabled = true;
    }
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
        icon: 'bookmark',
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
        this.utils.showIconToast(anime.nombre+" fue agregado a tus favoritos", "bookmark", 2);
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


  // Lists methods

  private async getUserLists(ordering: string) : Promise<void> {

    this.fetching = true;
    await this.database.getUserLists(1, ordering, this.user.token).then(data => {
      this.listsResults = data.results;
      this.fetching = false;

      this.listsPagination = {
        'actualPage': 1,
        'hasNextPage': data.next != null,
      }
    }); // no hay catch porque los errores se controlan en el servicio

    if (this.listsResults.length == 0) {
      this.noListsResults = true;
      setTimeout(() => {
        this.listsInfiniteScroll.disabled = true;
      }, 1);
    } else {
      setTimeout(() => {
        this.listsInfiniteScroll.disabled = false;
      }, 1);
      this.noListsResults = false;
    }
  }

  public loadMoreListsResults(event) {
    if (this.listsPagination.hasNextPage) {

      this.database.getUserLists(this.listsPagination.actualPage + 1, this.sortName, this.user.token).then(data => {

        this.listsResults = this.listsResults.concat(data.results);
        this.listsPagination = {
          'actualPage': this.listsPagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }); // no hay catch porque los errores se controlan en el servicio

    } else {
      event.target.complete();
      this.listsInfiniteScroll.disabled = true;
    }
  }

  public async saveList() {

    let loaderText = this.listsCreateModalAction == 1 ? "Guardando lista..." : "Editando lista...";
    const loader = await this.utils.createIonicLoader(loaderText);
    loader.present();

    switch (this.listsCreateModalAction) {
      case 1: // Crear
        await this.database.createUserList(this.user.token, this.formList.value.name, this.formList.value.description).then(data => {
          this.utils.showToast("Lista creada correctamente", 1, true);
          this.formList.reset();
          this.listsResults.unshift(data);
          this.noListsResults = false;
          this.modalCreateList.dismiss();
        }).catch(() => {
          this.utils.showToast("Ha ocurrido un error, intenta más tarde", 2, false);
        });
        break;
      case 2: // Editar
        this.database.updateUserList(this.user.token, this.editListActiveObj.id, this.formList.value.name, this.formList.value.description, this.editListActiveObj.order).then(data => {
          this.utils.showToast("Lista editada correctamente", 1, true);
          this.formList.reset();
          const editedIndex = this.listsResults.findIndex(list => list.id == this.editListActiveObj.id);
          this.listsResults[editedIndex] = data;
          this.modalCreateList.dismiss();
        }).catch(() => {
          this.utils.showToast("Ha ocurrido un error, intenta más tarde", 2, false);
        });
        break;
      default:
        break;
    }
    loader.dismiss();
  }

  public openModalCreateList() {
    this.listsCreateModalAction = 1;
    this.formList.reset();
    this.dinamicListCreateModalTitle = "Crear lista";
    this.dinamicListCreateModalButton = "Crear";
    this.modalCreateList.present();
  }

  public openList(list: any) {
    console.log(list);
  }

  public async openListOptions(list: any) {
    const subHeaderText = list.anime_quantity + " elementos";
    const actionSheet = await this.actionSheetCtrl.create({
      header: list.name,
      subHeader: subHeaderText,
      buttons: [
        {
          text: "Editar",
          icon: "create",
          handler: () => {
            this.formList.controls['name'].setValue(list.name);
            this.formList.controls['description'].setValue(list.description);
            this.listsCreateModalAction = 2;
            this.editListActiveObj = list;
            this.dinamicListCreateModalTitle = "Editar lista";
            this.dinamicListCreateModalButton = "Editar";
            this.modalCreateList.present();
          }
        },
        {
          text: "Eliminar",
          icon: "trash",
          handler: async () => {
            const alert = await this.alertCtrl.create({
              header: "Eliminar lista",
              message: "¿Estás seguro de que quieres eliminarla?",
              mode: 'ios',
              translucent: true,
              buttons: [
                {
                  text: "Cancelar",
                  role: "cancel"
                },
                {
                  text: "Eliminar",
                  handler: async () => {
                    const loader = await this.utils.createIonicLoader("Eliminando...");
                    loader.present();
                    this.database.deleteUserList(list.id, this.user.token).then(() => {
                      this.getUserLists(this.sortName);
                      this.utils.showToast("Lista eliminada correctamente", 1, true);
                    }).catch(() => {
                      this.utils.showToast("Ha ocurrido un error, intenta más tarde", 2, false);
                    }).finally(() => {
                      loader.dismiss();
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        },
        {
          text: "Cerrar",
          role: "cancel",
          icon: "close"
        }
      ]
    });
    await actionSheet.present();
  }

  public async handleListReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    
    const listToBeMoved = this.listsResults[ev.detail.from];
    const listToBeMovedTo = this.listsResults[ev.detail.to];
    this.database.updateUserList(this.user.token, listToBeMoved.id, listToBeMoved.name, listToBeMoved.description, listToBeMovedTo.order).catch(() => {
      this.utils.showToast("Ha ocurrido un error al intentar reordenar", 1, false);
      this.listsReorderDisabled = true;
    });

    this.database.updateUserList(this.user.token, listToBeMovedTo.id, listToBeMovedTo.name, listToBeMovedTo.description, listToBeMoved.order).catch(() => {
      this.utils.showToast("Ha ocurrido un error al intentar reordenar", 1, false);
      this.listsReorderDisabled = true;
    });

    ev.detail.complete();
  }

  public toggleListsReorder() {
    this.listsReorderDisabled = !this.listsReorderDisabled;

    if (this.listsReorderDisabled) {
      this.utils.showToast("Reorden desactivado", 1, false);
    } else {
      this.utils.showToast("Reorden activado", 1, true);
    }
  }
}
