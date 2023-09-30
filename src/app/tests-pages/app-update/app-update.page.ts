import { Component, OnInit } from '@angular/core';
import { AppUpdate, AppUpdateAvailability, AppUpdateInfo, FlexibleUpdateInstallStatus, AppUpdateResult, AppUpdateResultCode } from '@capawesome/capacitor-app-update';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-app-update',
  templateUrl: './app-update.page.html',
  styleUrls: ['./app-update.page.scss'],
})
export class AppUpdatePage implements OnInit {

  public updateAvailable: boolean = false;
  public infoUpdateText: string = '';
  public codeVersionAvailable: string = '';

  constructor(private platform: Platform, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        this.checkForUpdate();
      } else {
        this.infoUpdateText = 'Plataforma no soportada (' + this.platform.platforms() + ')';
      }
    });
  }

  private checkForUpdate() {
    AppUpdate.getAppUpdateInfo().then((updateInfo) => {
      console.log('updateInfo -> ' + JSON.stringify(updateInfo));
      if (updateInfo.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        this.updateAvailable = true;
        this.infoUpdateText = "Hay una actualización disponible";
        this.codeVersionAvailable = updateInfo.availableVersion;
      } else if (updateInfo.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS) {
        this.infoUpdateText = "Actualización en progreso";
      } else if (
        updateInfo.updateAvailability === AppUpdateAvailability.UPDATE_NOT_AVAILABLE || 
        updateInfo.updateAvailability === AppUpdateAvailability.UNKNOWN
      ) {
        this.infoUpdateText = "No hay actualizaciones disponibles";
      }
    });
  }

  public async beginProcess(process: number) {
    const alert = await this.alertCtrl.create({
      header: 'Actualización disponible',
      message: 'Hay una nueva versión disponible, debes actualizar para seguir usando la aplicación.',
      mode: 'ios',
      translucent: true,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Actualizar',
          handler: async () => {

            switch (process) {
              // Método actualización inmediata
              case 1:
                AppUpdate.performImmediateUpdate();
                break;
              case 2:
                AppUpdate.openAppStore();
                break;
              default:
                break;
            }

            // No se puede cerrar la alerta
            return false;
          }
        }
      ]
    });
    alert.present();
  }

}
