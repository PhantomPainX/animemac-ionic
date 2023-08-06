import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SigninPage } from '../auth/signin/signin.page';
import { RegisterPage } from '../auth/register/register.page';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  constructor(public navCtrl: NavController, public utils: UtilsService, public alertCtrl: AlertController, 
    public localStorage: PreferencesService, public platform: Platform, public modalCtrl: ModalController) { }

  ngOnInit() {

    this.platform.ready().then(() => {
      this.utils.setDefaultStatusBarColor();
    });

  }

  async goToLogin() {
    const modal = await this.modalCtrl.create({
      component: SigninPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        openedAsModal: true
      }
    });
    modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.navCtrl.navigateRoot("/tablinks/home", { animated: true, animationDirection: 'forward', replaceUrl: true });
    }
  }

  async goToRegister() {
    const modal = await this.modalCtrl.create({
      component: RegisterPage,
      cssClass: 'rounded-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        openedAsModal: true
      }
    });
    modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.navCtrl.navigateRoot("/tablinks/home", { animated: true, animationDirection: 'forward', replaceUrl: true });
    }
  }

  async enterAsGuest() {

    const alert = await this.alertCtrl.create({
      header: '¿Seguro?',
      message: 'Si entras como invitado, tus funciones se limitaran a revisar el catálogo y no podrás ver los videos.',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Si',
          handler: async () => {
            await this.localStorage.setLogged(false);
            await this.localStorage.setGuest(true);
            this.utils.showToast('Bienvenido Invitado', 2, false);
            this.navCtrl.navigateRoot("/tablinks/home", { animated: true, animationDirection: 'forward', replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }

}
