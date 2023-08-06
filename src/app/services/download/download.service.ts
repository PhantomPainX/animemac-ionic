import { Injectable } from '@angular/core';

import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@capacitor-community/file-opener';
import { UtilsService } from '../utils.service';
import { Platform, ToastController, ToastOptions } from '@ionic/angular';
import { PreferencesService } from '../preferences/preferences.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  public progress: number = 0;
  public requestId: any;

  constructor(
    public http: HTTP,
    public file: File,
    public utils: UtilsService,
    public platform: Platform,
    public toastCtrl: ToastController,
    public preferences: PreferencesService
  ) { }

  async downloadVideo(episode: any, video: any) {

    let videoFolder: string, directory: string, downloadsFolder: string, fullDownloadPath: string = "";
    const videoName: string = episode.numero;

    if (this.platform.is('android')) {

      // const permissionStatus: PermissionStatus = await Filesystem.checkPermissions();

      // if (permissionStatus.publicStorage != "granted") {

      //   const permission = await Filesystem.requestPermissions();
      //   if (permission.publicStorage != "granted") {
      //     this.utils.showToast("No se pueden descargar videos sin permisos de almacenamiento", 2, false);
      //     return;
      //   }
      // }

      videoFolder = this.createSlug(episode.anime.nombre);
      downloadsFolder = "download/AnimeMeow"
      directory = this.file.externalRootDirectory;
      const mainFolderIsCreated = await this.file.checkDir(directory, downloadsFolder).catch((reason) => {
        console.log("No existe el directorio 1: " + JSON.stringify(reason));
      });
      if (!mainFolderIsCreated) {
        await this.file.createDir(directory, downloadsFolder, false).catch((reason) => {
          console.log("No se pudo crear 1: " + JSON.stringify(reason));
        });
      }
      const videoFolderIsCreated = await this.file.checkDir(directory + downloadsFolder + '/', videoFolder).catch((reason) => {
        console.log("No existe el directorio 2: " + JSON.stringify(reason));
      });
      if (!videoFolderIsCreated) {
        await this.file.createDir(directory + downloadsFolder + '/', videoFolder, false).catch((reason) => {
          console.log("No se pudo crear 2: " + JSON.stringify(reason));
        });
      }
      fullDownloadPath = directory + downloadsFolder + '/' + videoFolder + '/' + videoName + this.utils.getVideoFormat(video.file);
    } else if (this.platform.is('ios')) {
      videoFolder = episode.anime.nombre;
      directory = this.file.documentsDirectory;
      fullDownloadPath = directory + "Descargas/" + videoFolder + "/" + videoName + this.utils.getVideoFormat(video.file);
    }

    this.preferences.setIsDownloading(true);
    const videoPath = fullDownloadPath;
    console.log("Video path: " + videoPath);

    this.requestId = null;
    this.progress = 0;

    const toast = await this.toastCtrl.create({
      message: 'Descargando ' + episode.anime.nombre + ' Episodio ' + episode.numero+ ' ('+(this.progress*100)+'%)',
      mode: 'ios',
      position: 'top',
      layout: 'stacked',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: async () => { 
            this.http.abort(this.requestId).then((response) => {
              this.preferences.setIsDownloading(false);
              toast.dismiss();
            }).catch(() => {
              this.toastCtrl.create({
                message: 'Error al cancelar, cierra la aplicación por favor',
                mode: 'ios',
                position: 'top',
                icon: 'skull',
                buttons: [
                  {
                    text: 'Aceptar',
                    role: 'cancel'
                  }
                ]
              }).then((toast) => {
                toast.present();
              });
            });
          }
        }
      ]
    });

    await toast.present();

    this.requestId = this.http.downloadFileSync(video.file, {}, video.headers, videoPath, (progressData) => {
      this.progress = Math.round((100 * progressData.transferred) / progressData.total) / 100;
      toast.message = 'Descargando ' + episode.anime.nombre + ' Episodio ' + episode.numero+ ' ('+(this.progress*100)+'%)';
      console.log("Progress: " + this.progress);
    }, (response) => {
      this.preferences.setIsDownloading(false);
      toast.dismiss();
      
      this.toastCtrl.create({
        message: 'Video descargado',
        mode: 'ios',
        position: 'top',
        icon: 'checkmark',
        buttons: [
          {
            text: 'Abrir',
            handler: () => {
              this.openFile(videoPath, this.utils.getVideoMimeType(video.file));
            }
          },
          {
            text: 'Aceptar',
            role: 'cancel'
          }
        ]
      }).then((toast) => {
        toast.present();
      });
    }, (error) => {
      this.preferences.setIsDownloading(false);
      toast.dismiss();

      if (error.status != -8) {
        this.toastCtrl.create({
          message: 'Error al descargar el video',
          mode: 'ios',
          position: 'top',
          duration: 2000,
          icon: 'bug'
        }).then((toast) => {
          toast.present();
        });
      }

    });
  }

  async openFile(path: string, fileType: any) {
    FileOpener.open({
      filePath: path,
      contentType: fileType,
      openWithDefault: true
    }).then(() => {
      console.log('File is opened');
    }).catch(e => {
      console.log('Error opening file: ' + e);
    });
  }

  createSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g,'')
      .replace(/ +/g,'-')
      ;
  }
}
