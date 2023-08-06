import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonInfiniteScroll, Platform } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.page.html',
  styleUrls: ['./blocked-users.page.scss'],
})
export class BlockedUsersPage implements OnInit {

  @ViewChild('infiniteScroll') InfiniteScroll;

  public user: PrivateUser;
  public blockedUsers: any[] = null;
  public blockedUsersPagination: any;
  public domain: string = environment.root_url;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = '-created_at';

  constructor(public moderation: ModerationService, public platform: Platform, public localStorage: PreferencesService, 
    public utils: UtilsService, public alertCtrl: AlertController) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.user = await this.localStorage.getUser();
      this.getBlockedUsers();
      setTimeout(() => {
        this.InfiniteScroll.disabled = true;
      }, 1);
    });
  }

  async getBlockedUsers() {
    await this.moderation.getBlockedUsers(this.user.token, 1, this.sortName).then((res) => {
      this.blockedUsers = res.results;

      if (this.blockedUsers.length > 0) {
        this.InfiniteScroll.disabled = false;
      }

      this.blockedUsersPagination = {
        'actualPage': 1,
        'hasNextPage': res.next != null,
      }
    });
  }

  async toggleRefreshBlockedUsers(event) {
    await this.getBlockedUsers();
    event.target.complete();
  }

  async loadMoreBlockedUsers(event) {
    if (this.blockedUsersPagination.hasNextPage) {
      const nextPage = this.blockedUsersPagination.actualPage + 1;
      await this.moderation.getBlockedUsers(this.user.token, nextPage, this.sortName).then((res) => {
        this.blockedUsers = this.blockedUsers.concat(res.results);
        this.blockedUsersPagination = {
          'actualPage': nextPage,
          'hasNextPage': res.next != null,
        }
        event.target.complete();
      }).catch(() => {
        const interval = setInterval(() => {
          this.loadMoreBlockedUsers(event).then(() => {
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
    this.blockedUsers = null;
    this.getBlockedUsers();
  }

  async unblockUser(blockObj: any) {

    const alert = await this.alertCtrl.create({
      header: 'Desbloquear usuario',
      subHeader: '¿Estás seguro de que quieres desbloquear al usuario '+blockObj.blocked_user_detail.username+'?',
      message: 'Una vez desbloquees a '+blockObj.blocked_user_detail.username+', podrás volver a ver sus comentarios y respuestas',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desbloquear',
          handler: async () => {
            const loader = await this.utils.createIonicLoader('Desbloqueando usuario...');
            await loader.present();
            await this.moderation.unblockUser(this.user.token, blockObj.id).then(async (res) => {
              loader.dismiss();
              if (res) {
                
                const alert = await this.alertCtrl.create({
                  header: 'Usuario desbloqueado',
                  subHeader: 'El usuario '+blockObj.blocked_user_detail.username+' ha sido desbloqueado correctamente',
                  message: 'Puedes volver a bloquearlo cuando quieras',
                  cssClass: 'alert-report-comment',
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

                this.getBlockedUsers();
              } else {
                this.utils.showToast('No se pudo desbloquear al usuario', 1, true);
              }
            }).catch(async (err) => {
              loader.dismiss();
              this.utils.showToast(err.error, 1, true);
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
