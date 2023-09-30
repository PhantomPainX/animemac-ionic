import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-full-version-info',
  templateUrl: './full-version-info.page.html',
  styleUrls: ['./full-version-info.page.scss'],
})
export class FullVersionInfoPage implements OnInit {

  private domain: string = environment.root_url;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  openInfoUrl() {
    const url = this.domain + "/aplicacion/";
    Browser.open({ url: url });
  }

}
