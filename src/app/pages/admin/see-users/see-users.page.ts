import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonInfiniteScroll, IonItemSliding, ModalController, NavController, Platform, ToastController } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { UserDetailPage } from './user-detail/user-detail.page';

@Component({
  selector: 'app-see-users',
  templateUrl: './see-users.page.html',
  styleUrls: ['./see-users.page.scss'],
})
export class SeeUsersPage implements OnInit {

  @ViewChild(IonInfiniteScroll) InfiniteScroll;

  public user: PrivateUser;
  public users: any[] = null;
  public cantUsers: number = 0;
  public usersPagination: any;
  public domain: string = environment.root_url;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = '-date_joined';

  public searchValue: string = '';

  constructor(public database: MysqlDatabaseService, public localStorage: PreferencesService, public platform: Platform, 
    public utils: UtilsService, public alertCtrl: AlertController, public moderationService: ModerationService, 
    public toastCtrl: ToastController, public modalCtrl: ModalController) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.user = await this.localStorage.getUser();
      this.getUsers('');
    });
  }

  async getUsers(search: string) {
    await this.database.getUsers(this.user.token, 1, this.sortName, search).then((res) => {
      this.users = res.results;
      this.cantUsers = res.count;

      this.usersPagination = {
        'actualPage': 1,
        'hasNextPage': res.next != null,
      }
    });
  }

  openUserImage(user) {
    const image = this.domain + user.user_extra.avatar;
    this.utils.openImageViewer([image], user.username);
  }

  async toggleRefreshUsers(event) {
    await this.getUsers(this.searchValue);
    event.target.complete();
  }

  async loadMoreUsers(event) {
    if (this.usersPagination.hasNextPage) {
      const nextPage = this.usersPagination.actualPage + 1;
      await this.database.getUsers(this.user.token, nextPage, this.sortName, this.searchValue).then((res) => {
        this.users = this.users.concat(res.results);
        this.usersPagination = {
          'actualPage': nextPage,
          'hasNextPage': res.next != null,
        }
        event.target.complete();
      }).catch(() => {
        const interval = setInterval(() => {
          this.loadMoreUsers(event).then(() => {
            event.target.complete();
            clearInterval(interval);
          });
        }, 3000);
      });
    } else {
      event.target.complete();
      this.InfiniteScroll.disabled = true;
    }
  }

  openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    this.users = null;
    this.getUsers(this.searchValue);
  }

  async banUser(user: any, slidingItem: any) {
    const alert = await this.alertCtrl.create({
      header: 'Ingresa la razón de la prohibición',
      message: user.username+" ya no podrá acceder a la aplicación",
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Banear',
          handler: async (inputs) => {
            if (!inputs.reason) {
              if (await this.toastCtrl.getTop() == null) {
                this.utils.showToast('Debes ingresar la razón de la prohibición', 1, true);
              }
              return false;
            }
      
            const loader = await this.utils.createIonicLoader('Baneando usuario...');
            await loader.present();
            await this.moderationService.banUser(this.user.token, user.id, inputs.reason).then(async (res) => {
              loader.dismiss();
              this.utils.showToast('Usuario baneado correctamente', 1, true);
              user.is_active = res.banned_user.is_active;
              user.user_extra = res.banned_user.user_extra;
            }).catch(async (err) => {
              loader.dismiss();
              console.log(err);
              this.utils.showToast(err.error, 1, true);
            });

            slidingItem.close();
          }
        }
      ],
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Razón',
        }
      ]
    });
    await alert.present();
  }

  async unbanUser(user: any, slidingItem: any) {
    const alert = await this.alertCtrl.create({
      header: 'Desbanear usuario',
      message: '¿Estás seguro de que quieres desbanear al usuario '+user.username+'?',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desbanear',
          handler: async () => {
            const loader = await this.utils.createIonicLoader('Desbaneando usuario...');
            await loader.present();
            await this.moderationService.unbanUser(this.user.token, user.id).then(async (res) => {
              loader.dismiss();
              this.utils.showToast('Usuario desbaneado correctamente', 1, true);
              user.is_active = res.unbanned_user.is_active;
              user.user_extra = res.unbanned_user.user_extra;
            }).catch(async (err) => {
              loader.dismiss();
              this.utils.showToast(err.error, 1, true);
            });
            slidingItem.close();
          }
        }
      ]
    });
    await alert.present();
  }

  async goToUserDetail(user: any, slidingItem: any) {
    slidingItem.close();
    const modal = await this.modalCtrl.create({
      component: UserDetailPage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        consultedUser: user
      }
    });
    await modal.present();
  }

  search(event) {
    this.searchValue = event.detail.value;
    this.users = null;
    this.getUsers(this.searchValue);
  }

}
