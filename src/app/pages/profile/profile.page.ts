import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { UserGroups } from 'src/app/classes/user-groups/user-groups';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { DeletePage } from './delete/delete.page';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public segment: string = 'about';
  public user: PrivateUser;
  public image: any;
  public staticImage: string;
  public domain: string = environment.root_url;

  public editingProfile: boolean = false;

  public formProfile: FormGroup;

  constructor(public localStorage: PreferencesService, public platform: Platform, 
    public profileService: ProfileService, public utils: UtilsService, public alertCtrl: AlertController, public formBuilder: FormBuilder, 
    public modalCtrl: ModalController, public navCtrl: NavController) {
      this.formProfile = new FormGroup({
        username: new FormControl({value: '', disabled: true}, Validators.compose([
          Validators.required, 
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9._-]*$/)
        ])),
        first_name: new FormControl({value: '', disabled: true}, Validators.compose([
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$/)
        ])),
        last_name: new FormControl({value: '', disabled: true}, Validators.compose([
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$/)
        ])),
        email: new FormControl({value: '', disabled: true}, Validators.compose([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
        ]))
      });
    }

  ngOnInit() {
    this.platform.ready().then(async () => {

      this.user = await this.localStorage.getUser();

      if (!this.user.user_extra?.avatar.includes(this.domain)) {
        this.image = this.domain + this.user.user_extra?.avatar;
        this.staticImage = this.domain + this.user.user_extra?.avatar;
      } else {
        this.image = this.user.user_extra?.avatar;
        this.staticImage = this.user.user_extra?.avatar;
      }
      
      this.formProfile.controls.username.setValue(this.user.username);
      this.formProfile.controls.first_name.setValue(this.user.first_name);
      this.formProfile.controls.last_name.setValue(this.user.last_name);
      this.formProfile.controls.email.setValue(this.user.email);
    });
  }

  ionViewWillEnter() {
    this.utils.setStatusBarStyle(true);
    this.utils.overlayStatusbar(true);
  }

  ionViewWillLeave() {
    this.utils.resetStatusBarColorOfToolbar();
  }

  allowEditProfile() {
    this.formProfile.get('username')?.enable();
    this.formProfile.get('first_name')?.enable();
    this.formProfile.get('last_name')?.enable();
    this.formProfile.get('email')?.enable();
    this.editingProfile = true;
  }

  disallowEditProfile() {
    this.formProfile.get('username').setValue(this.user.username)
    this.formProfile.get('first_name').setValue(this.user.first_name);
    this.formProfile.get('last_name').setValue(this.user.last_name);
    this.formProfile.get('email').setValue(this.user.email);

    this.formProfile.get('username')?.disable();
    this.formProfile.get('first_name')?.disable();
    this.formProfile.get('last_name')?.disable();
    this.formProfile.get('email')?.disable();
    this.editingProfile = false;
  }

  async editProfile() {
    //check if some value of form has changed
    if (this.formProfile.value.username != this.user.username || this.formProfile.value.first_name != this.user.first_name || this.formProfile.value.last_name != this.user.last_name || this.formProfile.value.email != this.user.email) {
      const username = this.formProfile.value.username;
      const first_name = this.formProfile.value.first_name;
      const last_name = this.formProfile.value.last_name;
      const email = this.formProfile.value.email;

      const loader = await this.utils.createIonicLoader('Actualizando...');
      loader.present();
      this.profileService.updateProfile(this.user.id, this.user.token, username, first_name, last_name, email).then(async (res) => {
        loader.dismiss();
        if (res.status) {
          this.user.username = username;
          this.user.first_name = first_name;
          this.user.last_name = last_name;
          this.user.email = email;

          let res_groups: any[] = res.user.groups;
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

          let user = new PrivateUser(
            res.user.id,
            res.user.username,
            res.user.email,
            res.user.first_name,
            res.user.last_name,
            res.user.token,
            res.user.is_active,
            res.user.is_staff,
            res.user.is_superuser,
            res.user.date_joined,
            res.user.last_login,
            res.user.created_with_google,
            user_groups,
            res.user.user_extra,
            res.user.reports
          );
          
          this.editingProfile = false;
          this.utils.showToast('Perfil actualizado', 1, true);
          this.localStorage.setUser(user);
        } else {
          this.utils.showToast(res.message, 2, false);
        }
      }).catch((error) => {
        loader.dismiss();
        this.utils.showToast(error, 2, false);
      });

    } else {
      this.utils.showToast('¡No hiciste ningun cambio!', 1, false);
    }
  }

  get errorControl() {
    return this.formProfile.controls;
  }

  async syncUser(showToast: boolean) {
    if (showToast) {
      var loader = await this.utils.createIonicLoader('Sincronizando...');
      loader.present();
    }
    await this.profileService.getUserPrivateDetail(this.user.id, this.user.token).then(async (user) => {
      if (showToast) {
        loader.dismiss();
      }

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

      await this.localStorage.setUser(newUser);
      
      this.image = this.domain + user.user_extra?.avatar;
      this.staticImage = this.domain + user.user_extra?.avatar;
      this.formProfile.controls.username.setValue(user.username);
      this.formProfile.controls.first_name.setValue(user.first_name);
      this.formProfile.controls.last_name.setValue(user.last_name);
      this.formProfile.controls.email.setValue(this.user.email);

      this.user = await this.localStorage.getUser();

      if (showToast) {
        await this.utils.showToast('Cuenta sincronizada', 1, true);
      }
    }).catch((error) => {
      if (showToast) {
        loader.dismiss();
        this.utils.showToast("Ocurrio un error inesperado", 2, false);
      }
    });
  }

  async requestSyncUser() {
    const alert = await this.alertCtrl.create({
      header: 'Sincronizar cuenta',
      message: '¿Deseas sincronizar los datos de tu cuenta?',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, 
        {
          text: 'Sincronizar',
          handler: () => {
            this.syncUser(true);
          }
        }
      ]
    });
    alert.present();
  }

  async onImageSelected(event) {
    //check if file is selected
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = this.utils.getFileReader();
      
      reader.onload = () => {
        this.image = reader.result as string;
      };

      reader.readAsDataURL(file);

      const alert = await this.alertCtrl.create({
        header: 'Cambiar foto de perfil',
        message: '¿Quieres cambiar tu foto de perfil?',
        mode: 'ios',
        translucent: true,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              event.target.value = '';
              this.image = this.staticImage;
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              this.uploadImage(event, file);
            }
          }
        ]
      });

      alert.present();
      
    } else {
      console.log('ERROR: No file selected');
    }
  }

  async startAccDeletion() {
    const modal = await this.modalCtrl.create({
      component: DeletePage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1
    });
    this.utils.setDefaultStatusBarColor();
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data.deleted) {
      this.navCtrl.navigateRoot('/welcome', { animated: true });

      this.alertCtrl.create({
        header: 'Cuenta eliminada',
        message: 'Tu cuenta ha sido eliminada correctamente',
        mode: 'ios',
        translucent: true,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Aceptar',
            role: 'cancel',
          }
        ]
      }).then((alert) => {
        alert.present();
      });

    }
  }

  async uploadImage(event, file) {
    const loader = await this.utils.createIonicLoader('Subiendo...');
    loader.present();
    
    await this.profileService.updateUserExtra(this.user.id, this.user.user_extra?.id, this.user.token, file, true).then(async (response) => {
      event.target.value = '';
      loader.dismiss();
      if (response.status) {
        this.image = response.userExtra.avatar;
        this.utils.showToast(response.message, 2, true);
        this.staticImage = this.image;
        await this.syncUser(false);
        this.profileService.updatedUserExtra$.emit(true);
      } else {
        this.image = this.staticImage;
        if (response.message == null) {
          this.utils.showToast('El nombre de la imagen es muy largo (max: 100 caracteres)', 2, false);
        } else {
          this.utils.showToast(response.message, 2, false);
        }
      }
    }).catch(() => {
      event.target.value = '';
      loader.dismiss();
      this.image = this.staticImage;
      this.utils.showToast('Ha ocurrido un error', 2, false);
    });
  }

  segmentChanged(event) {
    this.segment = event.detail.value;
  }

  openBlockedUsers() {
    this.navCtrl.navigateForward('/profile/blocked-users', { animated: true });
  }

}
