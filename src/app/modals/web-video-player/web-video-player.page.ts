import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ProvidersPopoverComponent } from 'src/app/components/providers-popover/providers-popover.component';

@Component({
  selector: 'app-web-video-player',
  templateUrl: './web-video-player.page.html',
  styleUrls: ['./web-video-player.page.scss'],
})
export class WebVideoPlayerPage implements OnInit {

  @Input() episode: any;
  public selectedEp: any;
  public safeUrl: SafeResourceUrl = null;
  public hasNextEp: boolean = true;
  public hasPrevEp: boolean = true;
  public buttonText: string = "Selecciona un video"

  constructor(private modalCtrl: ModalController, public sanitizer: DomSanitizer, private popoverCtrl: PopoverController) {
  }

  ngOnInit() {
    // this.openURL();
    console.log(this.episode);
    //order this.episode.anime.episodios by numero from lowest to highest
    this.episode.anime.episodios.sort((a: { numero: number; }, b: { numero: number; }) => (a.numero > b.numero) ? 1 : -1);
    this.selectedEp = this.episode;
    this.checkHasNextPrevEp();
  }

  checkHasNextPrevEp() {
    if (this.selectedEp.numero <= 1){
      this.hasPrevEp = false;
    } else {
      this.hasPrevEp = true;
    }
    if (this.selectedEp.numero == this.episode.anime.episodios.length){
      this.hasNextEp = false;
    } else {
      this.hasNextEp = true;
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  
  openURL(){
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl("https://voe.sx/e/yjxpwdo5nwhk");
  }

  async openProviders(event: any) {
    const popover = await this.popoverCtrl.create({
      component: ProvidersPopoverComponent,
      event: event,
      cssClass: "custom-popover",
      componentProps: {
        episode: this.selectedEp,
        animeImage: this.episode.anime.imagen,
        animeName: this.episode.anime.nombre,
        embedRequested: true
      }
    });
    popover.present();
    const { data } = await popover.onDidDismiss();

    if (data?.embedReady) {
      if (data?.embedUrl) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.embedUrl);
        this.buttonText = data?.embedName;
      }
    }
  }

  nextEp() {
    this.selectedEp = this.episode.anime.episodios[this.selectedEp.numero]; // Recuerda que array empieza en 0
    this.checkHasNextPrevEp();
    this.buttonText = "Selecciona un video";
    this.safeUrl = null;
  }

  prevEp() {
    this.selectedEp = this.episode.anime.episodios[this.selectedEp.numero - 2]; // Recuerda que array empieza en 0
    this.checkHasNextPrevEp();
    this.buttonText = "Selecciona un video";
    this.safeUrl = null;
  }

}
