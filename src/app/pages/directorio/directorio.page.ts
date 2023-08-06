import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInfiniteScroll, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { EpisodePage } from '../episode/episode.page';
import { UtilsService } from 'src/app/services/utils.service';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-directorio',
  templateUrl: './directorio.page.html',
  styleUrls: ['./directorio.page.scss'],
})
export class DirectorioPage implements OnInit {

  @ViewChild('mainSearchbar') searchBar;
  @ViewChild('InfiniteScrollSearched') InfiniteScrollSearched: IonInfiniteScroll;
  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;
  
  public animes: any[] = [];
  public resultsPagination: any;
  public searchQuery: string = '';
  public isLogged: boolean = false;
  public user: PrivateUser;
  public token: string = '';
  public domain: string = environment.root_url;

  public searching: boolean = false;

  @ViewChild('InfiniteScrollRandom') InfiniteScrollRandom: IonInfiniteScroll;
  public paginationRandom: any;
  public randomAnimes: any[] = [];
  public firstTime: boolean = true;

  constructor(
    public database: MysqlDatabaseService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public actionSheetCtrl: ActionSheetController,
    public utils: UtilsService,
    public platform: Platform,
    public localStorage: PreferencesService,
    public menu: MenuController
  ) {
  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
        this.token = this.user.token;
      }
    });

    this.getRandomAnimes();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.InfiniteScrollSearched.disabled = true;
    }, 1);
  }

  getRandomAnimes() {
    this.searching = true;
    this.database.getRandomAnimes(1, this.token).then((data) => {
      this.firstTime = false;
      this.InfiniteScrollRandom.disabled = false;
      this.animes = [];
      this.searching = false;

      this.randomAnimes = data.results;
      this.paginationRandom = {
        'actualPage': 1,
        'hasNextPage': data.next != null,
      }
    });
  }

  async search(event) {
    this.resultsPagination = {
      'actualPage': 1,
      'hasNextPage': false
    };

    if (this.searching) {
      return;
    }

    if (event.target.value.length >= 3) {
      this.searching = true;
      await this.database.findAnime(event.target.value, 1, this.token).then(data => {
        this.searching = false;
  
        if (data.count === 0) {
          this.utils.showToast('No se encontraron resultados', 1, false);
          this.InfiniteScrollSearched.disabled = true;

        } else {
          this.InfiniteScrollSearched.disabled = false;
          this.randomAnimes = [];
          this.InfiniteScrollRandom.disabled = true;

          this.animes = data.results;
          this.searchQuery = event.target.value;
          this.resultsPagination = {
            'actualPage': 1,
            'hasNextPage': data.next != null,
          }

          if (data.count === 1) {
            this.utils.showToast("Se encontro "+data.count+" resultado", 1, false);
          } else if (data.count > 1) {
            this.utils.showToast("Se encontraron "+data.count+" resultados", 1, false);
          }
        }
      }, error => { 
        console.log(error);
        this.searching = false;
        this.utils.showToast("Ocurrió un error... Intenta nuevamente", 1, false);
      });
    } else if (event.target.value.length === 0) {
      this.getRandomAnimes();
      this.InfiniteScrollSearched.disabled = true;
    } else {
      this.utils.showToast('Debes ingresar al menos 3 caracteres', 1, false);
      this.InfiniteScrollSearched.disabled = true;
    }

  }

  async goToAnimeDetail(anime: any) {
    // const modal = await this.modalCtrl.create({
    //   component: DetailPage,
    //   cssClass: 'fullscreenModal',
    //   componentProps: {
    //     anime: anime
    //   }
    // });
    // await modal.present();

    // modal.onWillDismiss().then(() => {
    //   this.utils.resetStatusBarColorOfToolbar();
    // });

    this.navCtrl.navigateForward('/detail/'+anime.id);
  }

  async loadMoreResults(event) {
    if (this.resultsPagination.hasNextPage) {

      await this.database.findAnime(this.searchQuery, this.resultsPagination.actualPage + 1, this.token).then(data => {
        this.animes = this.animes.concat(data.results);
        this.resultsPagination = {
          'actualPage': this.resultsPagination.actualPage + 1,
          'hasNextPage': data.next != null,
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
      this.InfiniteScrollSearched.disabled = true;
    }
  }

  loadMoreRandomAnimes(event) {
    if (this.paginationRandom.hasNextPage) {

      this.database.getRandomAnimes(this.paginationRandom.actualPage + 1, this.token).then(data => {

        let results = data.results;
        let cleanResults = results.filter((item) => {
          return !this.randomAnimes.find((i) => {
            return i.id === item.id;
          });
        });

        if (cleanResults.length > 0) {
          this.randomAnimes = this.randomAnimes.concat(cleanResults);
          this.paginationRandom = {
            'actualPage': this.paginationRandom.actualPage + 1,
            'hasNextPage': data.next != null,
          }
        } else {
          this.paginationRandom = {
            'actualPage': this.paginationRandom.actualPage + 1,
            'hasNextPage': false,
          }
          this.InfiniteScrollRandom.disabled = true;
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
      this.InfiniteScrollRandom.disabled = true;
    }
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
    }];
    
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

    const actionSheet = await this.actionSheetCtrl.create({
      header: anime.nombre,
      buttons: buttons
    });
    await actionSheet.present();
  }

  openMenu() {
    this.menu.open();
  }

}
