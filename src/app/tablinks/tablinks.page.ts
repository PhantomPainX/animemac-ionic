import { Component, OnInit } from '@angular/core';
import { AlertController, IonRouterOutlet, ModalController, NavController, Platform } from '@ionic/angular';
import { PreferencesService } from '../services/preferences/preferences.service';
import { ServerService } from '../services/firebase/server/server.service';
import { App } from '@capacitor/app';

//import { Device, DeviceInfo } from '@capacitor/device';
// import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { UtilsService } from '../services/utils.service';
import { PrivateUser } from '../classes/private-user/private-user';

//import { Browser } from '@capacitor/browser';

//import { LocalNotifications } from '@capacitor/local-notifications'
import { Subscription } from 'rxjs';
import { CommentsService } from '../services/comments/comments.service';
//import { RepliesPage } from '../modals/comment/replies/replies.page';

import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { ProfileService } from '../services/profile/profile.service';
import { UserGroups } from '../classes/user-groups/user-groups';
import { SharingService } from '../core/services/sharing/sharing.service';
import { environment } from 'src/environments/environment.prod';

export type TabSchema = {
  routerPath: string;
  label: string;
  icon: string;
  iconActive: string;
  default?: boolean;
};

@Component({
  selector: 'app-tablinks',
  templateUrl: './tablinks.page.html',
  styleUrls: ['./tablinks.page.scss'],
})
export class TablinksPage implements OnInit {

  public isLogged: boolean = false;
  public is_staff: boolean = false;
  public user: PrivateUser;
  public pushNotificationsAllowed: boolean = false;
  public localNotificationsAllowed: boolean = false;

  public backButtonSubscription: Subscription;
  private recentlyLoggedSubscription: Subscription;

  public loginInterval: any;

  private liteVersion: boolean = environment.liteVersion;

  public tabs: TabSchema[] = [
    {
      routerPath: 'home',
      label: 'Inicio',
      icon: 'home-outline',
      iconActive: 'home'
    },
    {
      routerPath: 'social-comments',
      label: 'Social',
      icon: 'chatbubble-ellipses-outline',
      iconActive: 'chatbubble-ellipses'
    },
    {
      routerPath: 'directorio',
      label: 'Directorio',
      icon: 'search-outline',
      iconActive: 'search'
    }
  ];

  constructor(public localStorage: PreferencesService, public platform: Platform,
    public routerOutlet: IonRouterOutlet, public alertCtrl: AlertController, public utils: UtilsService,
    public navCtrl: NavController, public fMessagingServer: ServerService, public commentsService: CommentsService, 
    public modalCtrl: ModalController, public profileService: ProfileService, public database: MysqlDatabaseService,
    private sharingService: SharingService) {

      this.recentlyLoggedSubscription = this.sharingService.getRecentlyLogged().subscribe(async (logged) => {
        if (logged) {
          this.loggedVerification();
        }
        this.recentlyLoggedSubscription.unsubscribe();
      });

      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(-1, () => {
        if (!this.routerOutlet.canGoBack()) {
          this.alertCtrl.create({
            header: 'Salir de la aplicación',
            message: '¿Estás seguro de que quieres salir de la aplicación?',
            mode: 'ios',
            translucent: true,
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Salir',
                handler: () => {
                  App.exitApp();
                }
              }
            ]
          }).then(alert => {
            alert.present();
          });
        }
      });

  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      // Android App Check Correct Version
      if (this.platform.is('android') && this.platform.is('capacitor')) {
        if (!this.liteVersion) {
          this.database.checkAndroidVersion().then((res) => {
            if (res) {
              if (!res.success) {
                this.utils.outdatedAppAlert(res.version, res.direct_download_link);
              }
            }
          });
        }
      }

      this.loggedVerification();
    });


  }

  ngOnDestroy() {
    // FirebaseMessaging.removeAllListeners();
    //LocalNotifications.removeAllListeners();
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
    if (this.recentlyLoggedSubscription) {
      this.recentlyLoggedSubscription.unsubscribe();
    }
    if (this.isLogged) {
      clearInterval(this.loginInterval);
    }
  }

  async loggedVerification() {
    this.isLogged = await this.localStorage.getLogged();
    if (this.isLogged) {
      //push tab in position 1
      this.tabs.splice(1, 0, {
        routerPath: 'favorites',
        label: 'Mis Listas',
        icon: 'bookmark-outline',
        iconActive: 'bookmark'
      });
      await this.localStorage.getUser().then((user) => {
        this.user = user;
        this.is_staff = user.is_staff;
      });

      this.loginInterval = setInterval(async () => {

        this.profileService.getUserPrivateDetail(this.user.id, this.user.token).then((user) => {
          let res_groups: any = user.groups;
          let user_groups = new UserGroups();
          
          if (res_groups.find(group => group == "Moderator")) {
            user_groups.moderator = true;
          } else {
            user_groups.moderator = false;
          }

          if (res_groups.find(group => group == "VIP")) {
            user_groups.vip = true;
          } else {
            user_groups.vip = false;
          }

          let newUser = new PrivateUser(
            user.id,
            user.username,
            user.email,
            user.first_name,
            user.last_name,
            user.token,
            user.is_active,
            user.is_staff,
            user.is_superuser,
            user.date_joined,
            user.last_login,
            user.created_with_google,
            user_groups,
            user.user_extra,
            user.reports
          );

          this.localStorage.setUser(newUser);
        })
        .catch(async (error) => {
          if (error.detail == "User inactive or deleted.") {
            clearInterval(this.loginInterval);
            await this.utils.showBanAlert();
          }
        });

      }, 600000); // cada 10 minutos se comprueba el usuario

      // await FirebaseMessaging.removeAllListeners();

      // await FirebaseMessaging.checkPermissions().then(async (res) => {
      //   //console.log('checkPermissions', JSON.stringify(res));
      //   if (res.receive != 'granted') {
      //     await FirebaseMessaging.requestPermissions().then(async (res) => {
      //       if (res.receive === 'granted') {
      //         const token = await FirebaseMessaging.getToken();
      //         this.pushNotificationsAllowed = true;
      //         //console.log('token', JSON.stringify(token));
      //         if (this.platform.is('android')) {
      //           const deviceId = await Device.getId();
      //           Device.getInfo().then((device: DeviceInfo) => {
      //             //console.log('device', JSON.stringify(device));

      //             device.name = device.name + " |";
      //             const deviceName = device.name + ' ' + device.manufacturer + " " + device.model + " - "+ device.operatingSystem + " " + device.osVersion;

      //             this.fMessagingServer.registerDeviceToken(this.user.token, deviceName, deviceId.uuid, token.token).then((res) => {
      //               //console.log('registerDeviceToken', JSON.stringify(res));
      //             }).catch((error) => {
      //               console.log('registerDeviceToken error', JSON.stringify(error));
      //             });
      //           });
      //         }

      //       } else {
      //         //console.log('no permission');
      //         this.utils.showToast('Si no aceptas los permisos de notificaciones, no podrás recibir notificaciones de la app.', 1, false);
      //       }
      //     });
      //   } else {
      //     const token = await FirebaseMessaging.getToken();
      //     this.pushNotificationsAllowed = true;
      //     //console.log('token', JSON.stringify(token));

      //     if (this.platform.is('android')) {
      //       const deviceId = await Device.getId();
      //       Device.getInfo().then((device: DeviceInfo) => {
      //         //console.log('device', JSON.stringify(device));

      //         device.name = device.name + " |";
      //         const deviceName = device.name + ' ' + device.manufacturer + " " + device.model + " - "+ device.operatingSystem + " " + device.osVersion;

      //         this.fMessagingServer.registerDeviceToken(this.user.token, deviceName, deviceId.uuid, token.token).then((res) => {
      //           console.log('registerDeviceToken');
      //         }).catch((error) => {
      //           console.log('registerDeviceToken error', JSON.stringify(error));
      //         });
      //       });
      //     }
      //   }
      // });

      // if (this.pushNotificationsAllowed) {
        
        // FirebaseMessaging.addListener('tokenReceived', async (token) => {
        //   console.log('tokenReceived');
        // });

        // FirebaseMessaging.addListener('notificationReceived', async (notification) => {

        //   if (!this.localNotificationsAllowed) {
        //     await LocalNotifications.checkPermissions().then(async (res) => {
        //       if (res.display != 'granted') {
        //         await LocalNotifications.requestPermissions().then(async (res) => {
        //           if (res.display === 'granted') {
        //             this.localNotificationsAllowed = true;
        //           }
        //         });
        //       } else {
        //         this.localNotificationsAllowed = true;
        //       }
        //     });

        //     if (this.localNotificationsAllowed) {

        //       const notificationinfo = notification.notification;
        //       const id = Math.floor(Math.random() * 1000000000);
        //       LocalNotifications.schedule({
        //         notifications: [
        //           {
        //             title: notificationinfo.title,
        //             body: notificationinfo.body,
        //             largeBody: notificationinfo.body,
        //             id: id,
        //             schedule: { at: new Date(Date.now() + 1000) },
        //             sound: null,
        //             attachments: null,
        //             actionTypeId: "",
        //             extra: notificationinfo.data
        //           }
        //         ]
        //       });

        //     }
        //   } else {
        //     const notificationinfo = notification.notification;
        //     //random 32 bit id for the notification
        //     const id = Math.floor(Math.random() * 1000000000);
        //     LocalNotifications.schedule({
        //       notifications: [
        //         {
        //           title: notificationinfo.title,
        //           body: notificationinfo.body,
        //           largeBody: notificationinfo.body,
        //           id: id,
        //           sound: null,
        //           attachments: null,
        //           actionTypeId: "",
        //           extra: notificationinfo.data
        //         }
        //       ]
        //     });
        //   }
        // });

        // FirebaseMessaging.addListener('notificationActionPerformed', async (notification: any) => {

        //   if (notification.notification.data.type === 'anime') {
        //     //cuando la aplicación está abierta
        //     const animeid = notification.notification.data.id;
        //     const image = notification.notification.data.image;

        //     this.navCtrl.navigateForward('/detail/'+animeid);
          
        //   } else if (notification.notification.data.type === 'animes') {

        //     this.navCtrl.navigateForward('/see-more', { queryParams: { type: "latest-japanese", title: "Últimos en Japonés", layoutStyle: "grid" } });

        //   } else if (notification.notification.data.type === 'episode') {

        //     const episodeid = notification.notification.data.id;

        //     this.navCtrl.navigateForward('/see-more', { queryParams: { type: "latest-episodes", title: "Últimos Episodios", layoutStyle: "list" } });
          
        //   } else if (notification.notification.data.type === 'url') {
        //     const url = notification.notification.data.url;
        //     Browser.open({ url: url });

        //   } else if (notification.notification.data.type === 'comment_reply') {
        //     const reply_type: string = notification.notification.data.reply_type;
        //     const comment_id = parseInt(notification.notification.data.comment_id);

        //     console.log('reply_type ' +reply_type);
        //     console.log('comment_id: ' + comment_id);

        //     const loader = await this.utils.createIonicLoader('Espera un momento...');
        //     loader.present();
        //     this.commentsService.getComment(comment_id, reply_type).then(async (res) => {
        //       loader.dismiss();
              
        //       const modal = await this.modalCtrl.create({
        //         component: RepliesPage,
        //         cssClass: 'rounded-modal',
        //         breakpoints: [0, 0.7, 1],
        //         initialBreakpoint: 0.7,
        //         componentProps: {
        //           'comment': res
        //         }
        //       });
        //       await modal.present();
        //     }).catch((err) => {
        //       console.log('getComment error: ', JSON.stringify(err));
        //       loader.dismiss();
        //       this.utils.showToast('Error al obtener el comentario, probablemente ya no existe', 1, true);
        //     });

        //   }
        // });

        // LocalNotifications.addListener('localNotificationActionPerformed', async (notification: any) => {

        //   if (notification.notification.extra.type === 'anime') {
        //     //cuando la aplicación está abierta
        //     const animeid = notification.notification.extra.id;
        //     const image = notification.notification.extra.image;

        //     this.navCtrl.navigateForward('/detail', { queryParams: { anime: animeid, image: image } });
          
        //   } else if (notification.notification.extra.type === 'animes') {

        //     this.navCtrl.navigateForward('/see-more', { queryParams: { type: "latest-japanese", title: "Últimos en Japonés", layoutStyle: "grid" } });

        //   } else if (notification.notification.extra.type === 'episode') {

        //     const episodeid = notification.notification.extra.id;

        //     this.navCtrl.navigateForward('/see-more', { queryParams: { type: "latest-episodes", title: "Últimos Episodios", layoutStyle: "list" } });
          
        //   } else if (notification.notification.extra.type === 'url') {
        //     const url = notification.notification.extra.url;
        //     Browser.open({ url: url });
        //   }
        // });
      // }
    }
  }

}
