import { Injectable } from '@angular/core';
import { MysqlDatabaseService } from '../mysql-database.service';
import { AnimemeowService } from '../providers/animemeow/animemeow.service';
import { AnimefenixService } from '../providers/animefenix/animefenix.service';
import { AnimeflvService } from '../providers/animeflv/animeflv.service';
import { AnimeuiService } from '../providers/animeui/animeui.service';
import { ResolversService } from '../resolvers/resolvers.service';
import { Domains } from 'src/app/components/embeds-popover/domains';
import { PopoverController } from '@ionic/angular';
import { VideosPopoverComponent } from 'src/app/components/videos-popover/videos-popover.component';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { VideoPlayerService } from '../video-player/video-player.service';

@Injectable({
  providedIn: 'root'
})
export class AutoplayService {

  videoDomains = new Domains;

  constructor(private database: MysqlDatabaseService, private animefenix: AnimefenixService, 
    private animeflv: AnimeflvService, private animemeow: AnimemeowService, private animeui: AnimeuiService, 
    private resolvers: ResolversService, private popoverCtrl: PopoverController, private players: VideoPlayerService) { }

  public async getEmbeds(episode: any, providerName: string, animeName: string, ep_number: number) {
    return new Promise(async (resolve, reject) => {

      if (providerName === null) {

        let bestToWorst = ['animemac', 'animemeow', 'animeflv', 'animefenix', 'animeui'];

        for (let i = 0; i < bestToWorst.length; i++) {
          const provider = bestToWorst[i];
          if (provider === 'animefenix') {
            this.animefenix.getEmbeds(episode).then(async (embeds: any) => {
              if (embeds.length > 0) {
                resolve(embeds);
              } else {
                reject('No embeds found');
              }
            }).catch(async error => {
              reject(error);
            });

          } else if (provider === 'animeflv') {
            this.animeflv.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
              if (embeds.length > 0) {
                resolve(embeds);
              } else {
                reject('No embeds found');
              }
            }).catch(async error => {
              reject(error);
            });

          } else if (provider === 'animemeow') {
            this.animemeow.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
              if (embeds.length > 0) {
                resolve(embeds);
              } else {
                reject('No embeds found');
              }
            }).catch(async error => {
              reject(error);
            });

          } else if (provider === 'animeui') {
            this.animeui.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
              if (embeds.length > 0) {
                resolve(embeds);
              } else {
                reject('No embeds found');
              }
            }).catch(async error => {
              reject(error);
            });
          } else if (provider === 'animemac') {
            this.database.getEpisodeDetail(episode).then(async (embeds: any) => {
              if (embeds.length > 0) {
                resolve(embeds);
              } else {
                reject('No embeds found');
              }
            }).catch(async error => {
              reject(error);
            });
          }
        }

      } else {
        if (providerName === 'animefenix') {
          this.animefenix.getEmbeds(episode).then(async (embeds: any) => {
            if (embeds.length > 0) {
              resolve(embeds);
            } else {
              reject('No embeds found');
            }
          }).catch(async error => {
            reject(error);
          });
  
        } else if (providerName === 'animeflv') {
          this.animeflv.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
            if (embeds.length > 0) {
              resolve(embeds);
            } else {
              reject('No embeds found');
            }
          }).catch(async error => {
            reject(error);
          });
  
        } else if (providerName === 'animemeow') {
          this.animemeow.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
            if (embeds.length > 0) {
              resolve(embeds);
            } else {
              reject('No embeds found');
            }
          }).catch(async error => {
            reject(error);
          });
  
        } else if (providerName === 'animeui') {
          this.animeui.getEmbeds(animeName, ep_number).then(async (embeds: any) => {
            if (embeds.length > 0) {
              resolve(embeds);
            } else {
              reject('No embeds found');
            }
          }).catch(async error => {
            reject(error);
          });
        } else if (providerName === 'animemac') {
          this.database.getEpisodeDetail(episode).then(async (embeds: any) => {
            if (embeds.length > 0) {
              resolve(embeds);
            } else {
              reject('No embeds found');
            }
          }).catch(async error => {
            reject(error);
          });
        }
      }
    });
  }

  public async getVideos(embed: any) {

    return new Promise(async (resolve, reject) => {
      
      embed = embed[0];

      if (this.videoDomains.getOkruDomains().some(domain => embed.url.includes(domain))) {
      
        await this.resolvers.okruResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getUqloadDomains().some(domain => embed.url.includes(domain))) {
        await this.resolvers.uqloadResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getYouruploadDomains().some(domain => embed.url.includes(domain))) {
        await this.resolvers.youruploadResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getMailruDomains().some(domain => embed.url.includes(domain))) {
        await this.resolvers.mailRuResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (embed.url.includes('animefenix')) {
  
        await this.resolvers.aFenixResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getAnimeuiDomains().some(d => embed.url.includes(d)) && !this.videoDomains.getIpfsDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.animeuiResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getStreamtapeDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.streamtapeResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getJwplayerDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.jwplayerResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getIronhentaiDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.ironhentaiResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getAnimepelixDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.animepelixResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getMp4uploadDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.mp4uploadResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getStreamhideDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.streamhideResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getSendvidDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.sendvidResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getMixdropDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.mixdropResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (this.videoDomains.getVoeDomains().some(d => embed.url.includes(d))) {
  
        await this.resolvers.voeResolver(embed.url).then(async data => {
          const videos: any = data;
          resolve(videos);
        }, () => {
          reject("No videos found");
        });
  
      } else if (((embed.url.includes('.mp4') || this.videoDomains.getFireloadDomains().some(d => embed.url.includes(d))) && (!this.videoDomains.getMp4uploadDomains().some(d => embed.url.includes(d)) && !this.videoDomains.getBurstcloudDomains().some(d => embed.url.includes(d)))) || this.videoDomains.getIpfsDomains().some(d => embed.url.includes(d))) {
        const video = {
          file: embed.url,
          headers: {
            Referer: embed.url
          }
        }
        resolve(video);
      }

    });
  }

  async openVideoPopover(event: any, videos: any, embedName: string, videoProviderDomains: string[], 
    episode: any, animeName: string, animeImage: string, providerName: string, loader: HTMLIonLoadingElement) {
    const popover = await this.popoverCtrl.create({
      component: VideosPopoverComponent,
      event: event,
      componentProps: {
        download: false,
        videos: videos,
        episode: episode,
        title: animeName,
        smallTitle: "Episodio " + episode.numero,
        image: animeImage,
        embedName: embedName,
        providerName: providerName.toLocaleLowerCase(),
        videoProviderDomains: videoProviderDomains,
        loader: loader
      }
    });
    await popover.present();
    await popover.onDidDismiss().then(data => {
      if (data.data) {
        if (data.data.openedVideo) {
          this.popoverCtrl.dismiss({openedVideo: true});
        }
      }
    });
  }

  async openSingleVideo(video: any, subtitleUrl: string, videoProviderDomains: string[], user: PrivateUser, episode: any, 
    deserveAd: boolean, animeName: string, animeImage: string, isLogged: boolean, settings: any, providerName: string, loader: HTMLIonLoadingElement) {

    if (user) {
      if (!user.is_staff && !user.groups.vip && !user.groups.moderator) {

        if (deserveAd) {

          // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
          //   this.popoverCtrl.dismiss({openedVideo: true});
          //   this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
          // }).catch((error) => {
          //   if (!error.cancelled) {
          //     this.popoverCtrl.dismiss({openedVideo: true});
          //     this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
          //   }
          // });
        } else {
          this.players.nativePlayer(video, subtitleUrl, animeName, "Episodio " + episode.numero, animeImage,
           episode, isLogged, user, settings, providerName.toLocaleLowerCase(), videoProviderDomains, "default", loader);
        }
  
      } else {
        this.players.nativePlayer(video, subtitleUrl, animeName, "Episodio " + episode.numero, animeImage,
         episode, isLogged, user, settings, providerName.toLocaleLowerCase(), videoProviderDomains, "default", loader);
      }

    } else {
      if (deserveAd) {
        // this.ads.fireRewardAdWithAlert("Ayudanos a seguir creciendo", "Mira un pequeño anuncio para poder ver el video", true).then(() => {
        //   this.popoverCtrl.dismiss({openedVideo: true});
        //   this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
        // }).catch((error) => {
        //   if (!error.cancelled) {
        //     this.popoverCtrl.dismiss({openedVideo: true});
        //     this.players.nativePlayer(video, subtitleUrl, this.animeName, "Episodio " + this.episode.numero, this.animeImage, this.episode, this.isLogged, this.user, this.settings);
        //   }
        // });
      } else {
        this.players.nativePlayer(video, subtitleUrl, animeName, "Episodio " + episode.numero, animeImage,
         episode, isLogged, user, settings, providerName.toLocaleLowerCase(), videoProviderDomains, "default", loader);
      }
    }
  }
}
