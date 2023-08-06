import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@capacitor-community/file-opener';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-download-video',
  templateUrl: './download-video.page.html',
  styleUrls: ['./download-video.page.scss'],
})
export class DownloadVideoPage implements OnInit {

  @Input() episode: any;
  @Input() video: any;

  public progress: number = 0;

  constructor(
    public httpClient: HttpClient,
    public http: HTTP,
    public changeDetectorRef: ChangeDetectorRef,
    public file: File,
    public utils: UtilsService,
    public platform: Platform,
    public modalController: ModalController,
    public toastCtrl: ToastController
  ) { }

  ngOnInit() {
    console.log("Video file: "+ this.video.file);
    console.log("Video headers: "+ this.video.headers);
    this.downloadVideo();
  }

  async downloadVideo() {

    const random_name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const directory = this.file.tempDirectory;
    const videoPath = directory + random_name + '.mp4';
    console.log("iOS Download Directory: " + directory);


    const toast = await this.toastCtrl.create({
      message: 'Descargando ' + this.episode.anime.nombre + ' - Episodio ' + this.episode.numero+ ' ('+(this.progress*100)+'%)',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { 
            console.log('Cancel clicked');
          }
        }
      ]
    });

    await toast.present();

    await this.http.downloadFile(this.video.file, {}, this.video.headers, videoPath, (progressData) => {
      this.progress = (Math.round((100 * progressData.transferred) / progressData.total)) / 100;
      toast.message = 'Descargando ' + this.episode.anime.nombre + ' - Episodio ' + this.episode.numero+ ' ('+(this.progress*100)+'%)';
      console.log("Progress: " + this.progress);
      this.changeDetectorRef.detectChanges();
    });

    if (this.platform.is('ios')) {
      this.openFile(videoPath);
    }

  }

  async openFile(path: string) {
    FileOpener.open({
      filePath: path,
      contentType: this.utils.getVideoMimeType(this.video.file),
      openWithDefault: true
    }).then(() => {
      console.log('File is opened');
    }).catch(e => {
      console.log('Error opening file: ' + e);
    });
  }

  close() {
    this.progress = 0;
    this.modalController.dismiss();
  }

}
