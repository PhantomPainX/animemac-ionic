import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {

  constructor(public alertCtrl: AlertController, public modalCtrl: ModalController, 
    public localStorage: PreferencesService) { }

  ngOnInit() {
  }

  accept() {
    this.localStorage.setAcceptedTerms(true);
    this.modalCtrl.dismiss({
      'accepted': true
    });
  }

  async deny() {
    this.localStorage.setAcceptedTerms(false);

    const alert = await this.alertCtrl.create({
      header: '¿Estás Seguro?',
      message: 'No podrás usar la aplicación con todas las funcionalidades sin aceptar estas políticas',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Si',
          handler: () => {
            this.modalCtrl.dismiss({
              'accepted': false
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
