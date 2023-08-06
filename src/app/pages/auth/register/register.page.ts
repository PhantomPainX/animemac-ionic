import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { UserGroups } from 'src/app/classes/user-groups/user-groups';
import { CustomModalPage } from 'src/app/modals/custom-modal/custom-modal.page';
import { TermsPage } from 'src/app/modals/terms/terms.page';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { UtilsService } from 'src/app/services/utils.service';

import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public formRegister: FormGroup;
  public isSubmitted: boolean = false;
  public imageBuffer: any = "assets/icon/default.webp";
  public image: any;
  public oldImage: any = "assets/icon/default.webp";
  public biometricCompatible: boolean = false;

  constructor(public utils: UtilsService, public route: ActivatedRoute, 
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public database: MysqlDatabaseService,
    public modalCtrl: ModalController,
    public localStorage: PreferencesService,
    public profileService: ProfileService,
    public alertCtrl: AlertController) {

    this.formRegister = this.formBuilder.group({
      username: ['', [
        Validators.required, 
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
      ]],
      first_name: ['', [
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$/)
      ]],
      last_name: ['', [
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ ]*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      passwordConfirm: ['', [
        Validators.required
      ]],
      coppa: [false, [
        Validators.requiredTrue
      ]],
      terms: [false, [
        Validators.requiredTrue
      ]]
    }, 
    {
      validator: this.mustMatch('password', 'passwordConfirm')
    })
  }

  ngOnInit() {

    this.localStorage.biometricCompatible().then(async res => {
      this.biometricCompatible = res;
    });
  }

  async register() {
    this.isSubmitted = true;
    if (this.formRegister.valid) {

      const userAcceptedTerms = await this.localStorage.getAcceptedTerms();

      if (userAcceptedTerms) {
        this.registerUser();
      } else {
        const modal = await this.modalCtrl.create({
          component: TermsPage,
          cssClass: 'modal-70-height',
          backdropDismiss: false,
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data.accepted) {
          this.registerUser();
        }
      }

      
      
    } else {
      return false;
    }
  }

  async registerUser() {

    this.database.signup(this.formRegister.value.username, this.formRegister.value.email, this.formRegister.value.password).then(async (data: any) => {
      const registered = data.registered;

      if (registered) {

        const modal = await this.modalCtrl.create({
          component: CustomModalPage,
          componentProps: {
            imagePath: 'assets/success.png',
            title: 'Cuenta creada exitosamente',
            message: '¡Bienvenido a la mejor aplicación para ver anime!. Una vez presiones el botón de abajo, iniciarás sesión automáticamente.',
            buttonText: 'Aceptar'
          },
          backdropDismiss: false,
          breakpoints: [0.6],
          initialBreakpoint: 0.6,
        });
        modal.onDidDismiss().then(async () => {
        
          const loader = await this.utils.createIonicLoader("Iniciando sesión...");
          await loader.present();

          this.database.signin(this.formRegister.value.email,this.formRegister.value.password).then(async res => {
            if (res.logged) {

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
              
              if (this.image) {
                const extra_res = await this.profileService.updateUserExtra(user.id, user.user_extra.id, user.token, this.image, true);
                if (extra_res.status) {
                  user.user_extra.avatar = extra_res.userExtra.avatar;
                }
              }

              if (this.formRegister.value.first_name || this.formRegister.value.last_name) {
                const user_res = await this.profileService.updateProfile(
                  user.id,
                  user.token,
                  user.username,
                  this.formRegister.value.first_name,
                  this.formRegister.value.last_name,
                  user.email
                )
                if (user_res.status) {
                  user.first_name = user_res.user.first_name;
                  user.last_name = user_res.user.last_name;
                }
              }

              this.utils.showToast("Bienvenido " + user.username + "!", 1, true);
              this.localStorage.setUser(user);
              this.localStorage.setLogged(true);
              this.localStorage.setGuest(false);
              this.setUserBioCredentials(this.formRegister.value.email, this.formRegister.value.password);
  
              this.database.recentlyLogged$.emit(true);
              this.modalCtrl.dismiss({ success: true });
              
            } else {
              this.utils.showToast("Usuario o contraseña incorrectos", 1, false);
            }

            loader.dismiss();
          }), error => {
            console.log(error);
            loader.dismiss();
            this.utils.showToast("Ocurrio un error", 2, false);
          }

        });
        await modal.present();
      } else {
        this.utils.showToast(data.message, 2, true);
      }
      
    }).catch(async () => {
      const modal = await this.modalCtrl.create({
        component: CustomModalPage,
        componentProps: {
          imagePath: 'assets/error.png',
          title: 'Ocurrió un error',
          message: 'Estamos trabajando para solucionarlo lo antes posible. Por favor, inténtalo de nuevo más tarde.',
          buttonText: 'Aceptar'
        },
        backdropDismiss: false,
        breakpoints: [0.6],
        initialBreakpoint: 0.6,
      });
      await modal.present();
    });
  }

  mustMatch(password: any, passwordConfirm: any) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const passwordConfirmControl = formGroup.controls[passwordConfirm];

      if (passwordControl.value !== passwordConfirmControl.value) {
        passwordConfirmControl.setErrors({ mustMatch: true });
      } else {
        passwordConfirmControl.setErrors(null);
      }
    }
  }

  // get errorControl() {
  //   return this.formRegister.controls;
  // }

  onImageSelected(event) {
    //check if file is selected
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = this.utils.getFileReader();

      reader.onload = () => {
          this.imageBuffer = reader.result as string;
      };

      reader.readAsDataURL(file);

      this.alertCtrl.create({
        header: 'Imagen de perfil',
        message: '¿Quieres usar esta imagen como tu imagen de perfil?',
        mode: 'ios',
        translucent: true,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              this.imageBuffer = this.oldImage;
            }
          }, {
            text: 'Sí',
            handler: () => {
              this.image = file;
              this.oldImage = this.imageBuffer;
            }

          }
        ]
      }).then(alert => {
        alert.present();
      });
    }
  }

  setUserBioCredentials(email: string, password: string) {
    NativeBiometric.setCredentials({
      username: email,
      password: password,
      server: environment.root_url,
    }).then(() => {
      this.localStorage.setUserHasBiometricCredentials(true);
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
