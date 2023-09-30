import { ElementRef, EventEmitter, Injectable, NgZone, ViewChild } from '@angular/core';
import { CapacitorVideoPlayer, capVideoPlayerOptions, capVideoPlayerIdOptions } from 'capacitor-video-player';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { UtilsService } from '../utils.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { MysqlDatabaseService } from '../mysql-database.service';
import { PreferencesService } from '../preferences/preferences.service';
import { environment } from 'src/environments/environment.prod';
import { Settings } from 'src/app/interfaces/settings';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  private capacitorVideoPlayer: any = CapacitorVideoPlayer;
  @ViewChild('toolbar', { read: ElementRef }) private toolbar: ElementRef;

  // [IMPORTANTE] Como es un servicio, se necesitan controlar las variables de forma manual
  // no tiene ciclo de vida como un componente

  private domain: string = environment.root_url;
  private seconds: number = 0;
  private interval: any;
  private videoDuration: number = 0.0;
  private seenSeconds: number = 0.0; // variable que guarda los segundos vistos del episodio
  private readyHandler: any;
  private endHandler: any;
  private exitHandler: any;
  private needSeek: boolean = false;
  private seekTime: number = 0;
  private episodeWasMarkedAsSeen: boolean = false;

  constructor(private screenOrientation: ScreenOrientation, private platform: Platform, private utils: UtilsService, 
    private database: MysqlDatabaseService, private localStorage: PreferencesService, 
    private zone: NgZone, private alertCtrl: AlertController, private sharingService: SharingService) {
  }

  private async toggleEpisode(episode: any, token: string) {

    this.database.toggleSeenEpisode(token, episode.id).then((added) => {
      if (added) {
        this.zone.run(() => {
          episode.seen = true;
        });
      }
    });
  }

  public async nativePlayer(video: any, subtitleUrl: string, title: string, smallTitle: string, image: string, episode: any, isLogged: boolean, user: any, 
    settings: Settings, providerName: string, videoProviderDomains: any, videoProviderQuality: string) {

      const loader = await this.utils.createIonicLoader("Por favor espera...");
      loader.present();
      const timeSeen = await this.getSeenEpisodeTime(episode.id, user.token);
      loader.dismiss();
      if (timeSeen != null && timeSeen.seconds > 0 && timeSeen.seconds < timeSeen.total_seconds) {
        const alert = await this.alertCtrl.create({
          header: '¿Continuar viendo?',
          message: 'Lo dejaste en el minuto '+this.utils.formatSeconds(timeSeen.seconds),
          mode: 'ios',
          translucent: true,
          buttons: [
            {
              text: 'Empezar de nuevo',
              handler: async () => {
                this.needSeek = false;
                this.seekTime = 0;
                this.seenSeconds = 0.0;
                this.videoDuration = 0.0;
                this.postSeenEpisodeTime(episode.id, user.token, 0, timeSeen.total_seconds);
                this.zone.run(() => {
                  episode.seconds_seen.seconds = 0;
                  episode.seconds_seen.total_seconds = timeSeen.total_seconds;
                  episode.seconds_seen.episode = episode.id;
                });
                this.executePlayer(video, subtitleUrl, title, smallTitle, image,
                   episode, isLogged, user, settings, providerName, videoProviderDomains, videoProviderQuality);
              }
            },
            {
              text: 'Continuar',
              handler: async () => {
                this.needSeek = true;
                this.seekTime = timeSeen.seconds;
                this.seenSeconds = timeSeen.seconds;
                this.videoDuration = timeSeen.total_seconds;
                this.executePlayer(video, subtitleUrl, title, smallTitle, image,
                   episode, isLogged, user, settings, providerName, videoProviderDomains, videoProviderQuality);
              }
            }
          ]
        });
        await alert.present();
      } else {
        this.needSeek = false;
        this.seekTime = 0;
        this.seenSeconds = 0.0;
        this.videoDuration = 0.0;
        this.executePlayer(video, subtitleUrl, title, smallTitle, image,
           episode, isLogged, user, settings, providerName, videoProviderDomains, videoProviderQuality);
      }
  
  }

  private async executePlayer(video: any, subtitleUrl: string, title: string, smallTitle: string, image: string, episode: any, isLogged: boolean, user: any, 
    settings: Settings, providerName: string, videoProviderDomains: any, videoProviderQuality: string) {

      this.episodeWasMarkedAsSeen = false;

      let options: capVideoPlayerOptions = {
        mode: 'fullscreen',
        url: video.file,
        playerId: 'player1',
        headers: video.headers,
        title: title,
        smallTitle: smallTitle,
        accentColor: "#64fada",
        chromecast: settings.chromecastEnabled,
        artwork: image,
        pipEnabled: settings.pipEnabled
      }

      if (subtitleUrl != "") {
        options.language = "es";
        options.subtitle = subtitleUrl;
        options.subtitleOptions = {
          backgroundColor: "rgba(0,0,0,0.6)"
        }
      }

      await this.capacitorVideoPlayer.initPlayer(options).then(() => {
        this.capacitorVideoPlayer.play({playerId: 'player1'}).then(async () => {
          if (this.platform.is('android')) {
            this.screenOrientation.unlock();
          }

          this.readyHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerReady', async (info) => {
            const playerIdOptions: capVideoPlayerIdOptions = {
              playerId: 'player1',
            }
            this.capacitorVideoPlayer.getDuration(playerIdOptions).then((duration) => {
              this.videoDuration = duration.value;
              console.log("Duración: "+this.videoDuration);
            });

            if (this.needSeek) {
              this.capacitorVideoPlayer.setCurrentTime({playerId: 'player1', seektime: this.seekTime});
            }
          });

          // Listener para cuando el usuario sale del reproductor prematuramente
          this.exitHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerExit', async (info) => {
            if (this.platform.is('android')) {
              this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            }
            
            console.log("Exit: "+ JSON.stringify(info));

            if (user) {
              // clearInterval(this.interval);
              // this.seconds = 0;

              console.log("Duración aaa: "+this.videoDuration);

              if (((info.currentTime * 100) / this.videoDuration) >= 70) { // 70%
                console.log("Visto: "+ JSON.stringify(info));
                if (isLogged && !episode.seen) {
                  this.episodeWasMarkedAsSeen = true;
                  this.toggleEpisode(episode, user.token);
                }

                this.localStorage.setAutoplayPreferences(
                  episode.anime_id,
                  providerName,
                  videoProviderDomains,
                  videoProviderQuality
                ).then(() => {
                  // this.recentlySawVideo$.emit({
                  //   episode: episode
                  // });
                  this.sharingService.emitAutoplayPreferencesChanged({
                    episode: episode
                  });
                });
              }

              // Esta condicion evalua si el usuario ha salido del video antes de que cargue, 
              // para que no se guarde el tiempo visto en 0 si ya tenia segundos vistos de antes
              if (!(info.currentTime == 0 && this.seenSeconds > 0)) {
                this.postSeenEpisodeTime(episode.id, user.token, info.currentTime, this.videoDuration).then(() => {

                  this.zone.run(() => {
                    if (episode.seconds_seen == null) {
                      episode.seconds_seen = {};
                    }
                    episode.seconds_seen.seconds = info.currentTime;
                    episode.seconds_seen.total_seconds = this.videoDuration;
                    episode.seconds_seen.episode = episode.id;

                    if (!this.episodeWasMarkedAsSeen) {
                      this.sharingService.emitEpisodeTimeSeenChanged(true);
                    }
                  });
                });
              }
            }
      
            if (this.platform.is('android')) {
      
              if (sessionStorage.getItem('detailMainColor')) {
                const color = JSON.parse(sessionStorage.getItem('detailMainColor'));
                if (color.isDark) {
                  this.toolbar.nativeElement.style.setProperty('--color', 'white');
                  if (this.platform.is('android')) {
                    StatusBar.setStyle({ style: Style.Dark });
                  }
                } else {
                  this.toolbar.nativeElement.style.setProperty('--color', 'black');
                  if (this.platform.is('android')) {
                    StatusBar.setStyle({ style: Style.Light });
                  }
                }
      
                sessionStorage.removeItem('detailMainColor');
      
              } else {
                this.utils.resetStatusBarColorOfToolbar();
              }
            }
      
            this.removeAllListeners();
          });
          
          // Listener para cuando se termina el video
          this.endHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerEnded', async () => {
            if (this.platform.is('android')) {
              this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            }

            console.log("Ended AAAA");
      
            if (user) {
              // clearInterval(this.interval);
              // this.seconds = 0;

              if (isLogged && !episode.seen) {
                this.episodeWasMarkedAsSeen = true;
                this.toggleEpisode(episode, user.token); 
              }

              this.postSeenEpisodeTime(episode.id, user.token, this.videoDuration, this.videoDuration).then(() => {
                this.zone.run(() => {
                  if (episode.seconds_seen == null) {
                    episode.seconds_seen = {};
                  }
                  episode.seconds_seen.seconds = this.videoDuration;
                  episode.seconds_seen.total_seconds = this.videoDuration;
                  episode.seconds_seen.episode = episode.id;

                  if (!this.episodeWasMarkedAsSeen) {
                    this.sharingService.emitEpisodeTimeSeenChanged(true);
                  }
                });
              });
            }
      
            if (this.platform.is('android')) {
      
              if (sessionStorage.getItem('detailMainColor')) {
                const color = JSON.parse(sessionStorage.getItem('detailMainColor'));
                if (color.isDark) {
                  this.toolbar.nativeElement.style.setProperty('--color', 'white');
                  if (this.platform.is('android')) {
                    StatusBar.setStyle({ style: Style.Dark });
                  }
                } else {
                  this.toolbar.nativeElement.style.setProperty('--color', 'black');
                  if (this.platform.is('android')) {
                    StatusBar.setStyle({ style: Style.Light });
                  }
                }
                
                sessionStorage.removeItem('detailMainColor');
              } else {
                this.utils.resetStatusBarColorOfToolbar();
              }
            }

            this.localStorage.setAutoplayPreferences(
              episode.anime_id,
              providerName,
              videoProviderDomains,
              videoProviderQuality
            ).then(() => {
              // this.recentlySawVideo$.emit({
              //   episode: episode
              // });
              this.sharingService.emitAutoplayPreferencesChanged({
                episode: episode
              });
            });
      
            this.removeAllListeners();
          });

        }).catch(() => {
          this.capacitorVideoPlayer.stopAllPlayers();
          if (this.platform.is('android')) {
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          }
        });
      }).catch(() => {
        this.capacitorVideoPlayer.stopAllPlayers();
      });

  }

  public playRadio() {
    let options: capVideoPlayerOptions = {
      mode: 'fullscreen',
      url: 'https://thisisamazing.tv/live.m3u8',
      playerId: 'player32',
      title: 'Music Live Radio',
      smallTitle: 'thisisamazing.tv',
      accentColor: "#64fada",
      chromecast: true,
      artwork: 'https://img.freepik.com/premium-photo/music-mind-music-abstract-art-created-with-generative-ai-technology_545448-15311.jpg',
      pipEnabled: true
    }
    this.capacitorVideoPlayer.initPlayer(options).then(() => {
      this.capacitorVideoPlayer.play({playerId: 'player32'}).then(async () => {
        if (this.platform.is('android')) {
          this.screenOrientation.unlock();
        }

        this.exitHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerExit', () => {
          if (this.platform.is('android')) {
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          }
        });

        this.endHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerEnded', () => {
          if (this.platform.is('android')) {
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          }
        });
      });
    });
  }

  private removeAllListeners() {
    this.readyHandler.remove();
    this.exitHandler.remove();
    this.endHandler.remove();
  }

  private getSeenEpisodeTime(episode: number, token: string) {
    return new Promise<any>((resolve, reject) => {
      const url = this.domain + '/api/v1/seen-episode-time/?episode=' + episode;
      fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Token ' + token
        }
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          if (data.count > 0) {
            resolve(data.results[0]);
          } else {
            resolve(null);
          }
        }).catch((error) => {
          reject(error);
        });
    });
  }

  private postSeenEpisodeTime(episode: number, token: string, seconds: number, total_seconds: number) {
    return new Promise<any>((resolve, reject) => {
      const url = this.domain + '/api/v1/seen-episode-time/';
      fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Token ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          episode: episode,
          seconds: seconds,
          total_seconds: total_seconds
        })
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
    });
  }

  public playLocalVideo(videoUri: string, title: string, smallTitle: string) {
    let options: capVideoPlayerOptions = {
      mode: 'fullscreen',
      url: videoUri,
      playerId: 'player473',
      title: title,
      smallTitle: smallTitle,
      accentColor: "#64fada",
      chromecast: true,
      artwork: '',
      pipEnabled: true
    }
    this.capacitorVideoPlayer.initPlayer(options).then(() => {
      this.capacitorVideoPlayer.play({playerId: 'player473'}).then(async () => {
        if (this.platform.is('android')) {
          this.screenOrientation.unlock();
        }

        this.exitHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerExit', () => {
          if (this.platform.is('android')) {
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          }
        });

        this.endHandler = await this.capacitorVideoPlayer.addListener('jeepCapVideoPlayerEnded', () => {
          if (this.platform.is('android')) {
            this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
          }
        });
      });
    });
  }
  
}
