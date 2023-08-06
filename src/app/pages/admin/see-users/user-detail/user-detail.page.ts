import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { ReportsPage } from './reports/reports.page';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {

  @Input() consultedUser: any;
  public isLogged: boolean = true;
  public user: PrivateUser;
  public domain: string = environment.root_url;

  constructor(public profileService: ProfileService, public platform: Platform, 
    public localStorage: PreferencesService, public modalCtrl: ModalController, 
    public toastCtrl: ToastController, public alertCtrl: AlertController, public moderationService: ModerationService, 
    public utils: UtilsService) { 
    }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
      }
    });
    console.log(this.consultedUser);
  }

  async banUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Ingresa la razón de la prohibición',
      message: user.username+" ya no podrá acceder a la aplicación",
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
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
              this.utils.showToast(err.error, 1, true);
            });
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

  async unbanUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Desbanear usuario',
      message: '¿Estás seguro de que quieres desbanear al usuario '+user.username+'?',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
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
          }
        }
      ]
    });
    await alert.present();
  }

  async openReports() {
    const modal = await this.modalCtrl.create({
      component: ReportsPage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        consultedUser: this.consultedUser,
        token: this.user.token
      }
    });
    await modal.present();
  }

  goBack() {
    this.modalCtrl.dismiss();
  }

}
