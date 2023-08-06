import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UtilsService } from 'src/app/services/utils.service';

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { NativeBiometric, BiometricOptions } from "@capgo/capacitor-native-biometric";
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.page.html',
  styleUrls: ['./delete.page.scss'],
})
export class DeletePage implements OnInit {

  public formPassword: FormGroup;
  public user: PrivateUser;
  public googleReady: boolean = false;
  public userHasBiometricCredentials: boolean = false;

  constructor(public modalCtrl: ModalController, public formBuilder: FormBuilder, 
    public database: MysqlDatabaseService, public utils: UtilsService, public alertCtrl: AlertController, 
    public platform: Platform, public localStorage: PreferencesService, public profileService: ProfileService) {
      this.formPassword = this.formBuilder.group({
        password: ['', [
          Validators.required,
          Validators.minLength(1),
        ]]
      })
    }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.user = await this.localStorage.getUser();

      if (this.user.created_with_google) {
        GoogleAuth.initialize({
          clientId: environment.googleAuthClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        this.googleReady = true;
      }

      this.localStorage.userHasBiometricCredentials().then((res) => {
        this.userHasBiometricCredentials = res;
      });
    });
  }

  ionViewWillLeave() {
    this.utils.setStatusBarStyle(true);
    this.utils.overlayStatusbar(true);
  }

  get errorControl() {
    return this.formPassword.controls;
  }

  async verifyPassword() {
    const loader = await this.utils.createIonicLoader('Verificando...');
    loader.present();
    console.log(this.formPassword.value.password);
    this.database.signin(this.user.username, this.formPassword.value.password).then((res) => {
      loader.dismiss();
      if (res.logged){
        this.showDeleteAlert();
      } else {
        this.utils.showToast('Contraseña incorrecta', 1, false);
      }
    }).catch(() => {
      loader.dismiss();
      this.utils.showToast('Contraseña incorrecta', 1, false);
    });
  }

  async googleVerify() {
    const loader = await this.utils.createIonicLoader("Esperando a Google...");
    await loader.present();

    GoogleAuth.signIn().then(async data => {
      const response: any = data;
      
      loader.dismiss();
      if (response.email == this.user.email) {
        this.showDeleteAlert();
      } else {
        this.utils.showToast('El correo electrónico no coincide', 1, false);
      }
    }).catch(error => {
      loader.dismiss();
    });
  }

  showDeleteAlert() {
    const alert = this.alertCtrl.create({
      header: '¿Estás seguro?',
      message: 'Si eliminas tu cuenta, no podrás recuperarla. Esta acción no se puede deshacer.',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteAccount();
          }
        }
      ]
    }).then(alert => alert.present());
  }

  async deleteAccount() {
    const loader = await this.utils.createIonicLoader('Eliminando cuenta...');
    loader.present();
    this.profileService.deleteUserData(this.user.id, this.user.token).then((deleted) => {
      loader.dismiss();
      if (deleted) {
        this.database.purgeSession();
        if (this.userHasBiometricCredentials) {
          NativeBiometric.deleteCredentials({
            server: environment.root_url,
          }).then(() => {
            this.localStorage.setUserHasBiometricCredentials(false);
          });
        }
        this.modalCtrl.dismiss({
          deleted: true
        });
      } else {
        this.utils.showToast('No se pudo eliminar la cuenta', 1, false);
      }
    }).catch(() => {
      loader.dismiss();
      this.utils.showToast('No se pudo eliminar la cuenta', 1, false);
    });
  }

  close() {
    this.modalCtrl.dismiss({
      deleted: false
    });
  }

}
