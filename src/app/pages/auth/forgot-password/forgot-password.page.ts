import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CustomModalPage } from 'src/app/modals/custom-modal/custom-modal.page';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  public formForgot: FormGroup;
  public isSubmitted: boolean = false;

  constructor(
    public route: ActivatedRoute, 
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public utilsService: UtilsService,
    public database: MysqlDatabaseService,
    public modalCtrl: ModalController
  ) {

    this.formForgot = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)
      ]]
    });
  }

  ngOnInit() {
  }

  get errorControl() {
    return this.formForgot.controls;
  }

  sendRecover() {
    this.isSubmitted = true;
    if (this.formForgot.valid) {
      this.database.recoverPassword(this.formForgot.value.email).then(async (data: any) => {
        if (data.result == 'success') {

          const modal = await this.modalCtrl.create({
            component: CustomModalPage,
            componentProps: {
              imagePath: 'assets/success.png',
              title: 'Correo de recuperación enviado',
              message: 'Hemos enviado un mensaje a la dirección de correo electrónico proporcionada. Por favor, revise su bandeja de entrada y siga las instrucciones para restablecer su contraseña.',
              buttonText: 'Aceptar'
            },
            backdropDismiss: false,
            breakpoints: [0.6],
            initialBreakpoint: 0.6,
          });
          modal.onDidDismiss().then(() => {
            this.modalCtrl.dismiss({ success: true });
          });
          await modal.present();

        } else if (data.result == 'Invalid email') {
          this.utilsService.showToast('El correo no es valido', 2, true);
        } else if (data.result == 'Invalid header found') {
          this.utilsService.showToast('Header no valido', 2, true);
        } else if (data.result == 'No email sent to server') {
          this.utilsService.showToast('No se pudieron enviar datos al servidor', 2, true);
        } else if (data.result == 'No user found') {
          this.utilsService.showToast('No se encontró el usuario', 2, true);
        } else {
          this.utilsService.showToast('Ocurrió un error al enviar el correo', 2, true);
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
    } else {
      return false;
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
