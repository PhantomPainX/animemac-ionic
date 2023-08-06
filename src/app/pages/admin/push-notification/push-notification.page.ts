import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { ServerService } from 'src/app/services/firebase/server/server.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.page.html',
  styleUrls: ['./push-notification.page.scss'],
})
export class PushNotificationPage implements OnInit {

  public pushForm: FormGroup;
  public user: PrivateUser;

  constructor(public formBuilder: FormBuilder, public notificationsServer: ServerService, public platform: Platform, 
    public localStorage: PreferencesService, public utils: UtilsService) {

    this.pushForm = this.formBuilder.group({
      //username can't be empty
      title: ['', Validators.compose([
        Validators.required,
        Validators.minLength(10)
      ])],
      //first_name can't be empty
      message: ['', Validators.compose([
        Validators.required,
        Validators.minLength(10)
      ])],
      //last_name can't be empty
      image: ['', Validators.compose([
        Validators.minLength(10)
      ])]
    });
  }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.user = await this.localStorage.getUser();
    });
  }

  get errorControl() {
    return this.pushForm.controls;
  }

  async onSubmit() {
    const loader = await this.utils.createIonicLoader('Enviando notificación...');
    await loader.present();
    if (this.pushForm.value.image == '') {
      this.pushForm.value.image = null;
    }
    this.notificationsServer.sendGlobalPushNotification(this.user.token, this.pushForm.value.title, this.pushForm.value.message, this.pushForm.value.image).then((res) => {
      this.utils.showToast('Notificación enviada correctamente', 1, true);
      loader.dismiss();
    }).catch((err) => {
      this.utils.showToast('Error al enviar la notificación', 1, true);
      console.log(err);
      loader.dismiss();
    });
  }

}
