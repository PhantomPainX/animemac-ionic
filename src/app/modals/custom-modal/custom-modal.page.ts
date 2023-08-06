import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.page.html',
  styleUrls: ['./custom-modal.page.scss'],
})
export class CustomModalPage implements OnInit {

  @Input() imagePath: string = "https://www.pngall.com/wp-content/uploads/2016/07/Success-PNG-Image.png";
  @Input() title: string = 'Custom Modal';
  @Input() message: string = "Hello from Custom Modal";
  @Input() buttonText: string = 'Close Modal';

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

}
