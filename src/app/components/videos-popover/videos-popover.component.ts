import { Component, Input, OnInit } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { Settings } from 'src/app/interfaces/settings';
import { AdsService } from 'src/app/services/ads/ads.service';
import { DownloadService } from 'src/app/services/download/download.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { VideoPlayerService } from 'src/app/services/video-player/video-player.service';

@Component({
  selector: 'app-videos-popover',
  templateUrl: './videos-popover.component.html',
  styleUrls: ['./videos-popover.component.scss'],
})
export class VideosPopoverComponent implements OnInit {

  @Input() download: boolean;
  @Input() videos: any;
  @Input() title: string;
  @Input() smallTitle: string;
  @Input() image: string;
  @Input() episode: any;
  @Input() embedName: string;
  @Input() providerName: string;
  @Input() videoProviderDomains: string[];

  public settings: Settings;

  public deserveAd: boolean = true;

  public isLogged: boolean = false;
  public user: PrivateUser;

  constructor(public players: VideoPlayerService, public popoverCtrl: PopoverController, 
    public ads: AdsService, public localStorage: PreferencesService, public platform: Platform, 
    public downloadService: DownloadService, public utils: UtilsService) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
      }

      this.deserveAd = await this.localStorage.getDeserveAd();
      this.settings = await this.localStorage.getSettings();
    });
  }

  async playVideo(video: any) {

    const isDownloading = await this.localStorage.getIsDownloading();
    if (this.download) {
      if (isDownloading) {
        this.utils.showToast("Hay una descarga en curso, no puedes ni descargar ni reproducir otro video", 2, false);
      } else {
        this.downloadService.downloadVideo(this.episode, video);
      }
      return;
    } else {
      if (isDownloading) {
        this.utils.showToast("Hay una descarga en curso, no puedes ni descargar ni reproducir otro video", 2, false);
        return;
      }
    }

    const captions = this.videos.filter(video => video.kind == "captions");
    let caption = "";
    if (captions.length > 0) {
      caption = captions[0].file;
    }

    if (this.user) {
      if (!this.user.is_staff && !this.user.groups.vip && !this.user.groups.moderator) {
        if (this.deserveAd) {
          // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
          //   this.popoverCtrl.dismiss({openedVideo: true});
          //   this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings);
          // }).catch((error) => {
          //   if (!error.cancelled) {
          //     this.popoverCtrl.dismiss({openedVideo: true});
          //     this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings);
          //   }
          // });
        } else {
          this.popoverCtrl.dismiss({openedVideo: true});
          this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings, this.providerName, this.videoProviderDomains, video.label);
        }
  
      } else {
        this.popoverCtrl.dismiss({openedVideo: true});
        this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings, this.providerName, this.videoProviderDomains, video.label);
      }

    } else {
        if (this.deserveAd) {
          // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
          //   this.popoverCtrl.dismiss({openedVideo: true});
          //   this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings);
          // }).catch((error) => {
          //   if (!error.cancelled) {
          //     this.popoverCtrl.dismiss({openedVideo: true});
          //     this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings);
          //   }
          // });
        } else {
          this.popoverCtrl.dismiss({openedVideo: true});
          this.players.nativePlayer(video, caption, this.title, this.smallTitle, this.image, this.episode, this.isLogged, this.user, this.settings, this.providerName, this.videoProviderDomains, video.label);
        }
    }
  }

  dismiss() {
    this.popoverCtrl.dismiss();
  }

}
