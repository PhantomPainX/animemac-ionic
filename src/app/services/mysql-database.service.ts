import { Injectable } from '@angular/core';
// import { Http } from '@capacitor-community/http';
// import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { UtilsService } from './utils.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { PreferencesService } from './preferences/preferences.service';
// import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { environment } from 'src/environments/environment.prod';
import { Settings } from '../interfaces/settings';
import { SharingService } from '../core/services/sharing/sharing.service';

// import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class MysqlDatabaseService {

  public settings: Settings;

  public domain = environment.root_url;

  public animeMedia = this.domain + "/media/"

  public oldHost = this.domain + environment.oldMobileApiPath;
  public backendAuthToken = environment.backendAuthToken;
  public backendAndroidAppHash = environment.backendAndroidAppHash;

  public amrGetFavoriteAnimes: boolean = false; //amr = already making request
  public amrGetLatestEpisodes: boolean = false;
  public amrGetAnimeDetail: boolean = false;
  public amrGetAnimes: boolean = false;
  public amrGetLatino: boolean = false;
  public amrGetSeries: boolean = false;
  public amrGetInBroadcast: boolean = false;
  public amrGetRandomAnimes: boolean = false;
  public amrGetNextToSee: boolean = false;
  public amrFindAnime: boolean = false;
  public amrGetEpisodeDetail: boolean = false;
  public amrSignin: boolean = false;
  public amrSocialSignin: boolean = false;
  public amrConfirmThirteenAgeCoppaCompliant: boolean = false;
  public amrSignup: boolean = false;
  public amrRecoverPassword: boolean = false;
  public amrCheckFavoriteAnime: boolean = false;
  public amrToggleFavoriteAnime: boolean = false;
  public amrCheckSeenEpisodes: boolean = false;
  public amrToggleSeenEpisode: boolean = false;
  public amrGetUsers: boolean = false;
  public amrGetRecursiveDataLanguages: boolean = false;
  public amrGetRecursiveDataStatus: boolean = false;
  public amrGetRecursiveDataTypes: boolean = false;
  public amrGetRecursiveDataGenres: boolean = false;
  public amrGetAnimesByGenre: boolean = false;
  public amrGetAnimesByType: boolean = false;
  public amrGetAnimesByStatus: boolean = false;
  public amrGetAnimesByLang: boolean = false;
  public amrGetAnimesByYear: boolean = false;
  public amrCheckAndroidVersion: boolean = false;
  public amrGetSeenEpisodesHistory: boolean = false;


  constructor(
    public utils: UtilsService,
    public localStorage: PreferencesService,
    private sharingService: SharingService
  ) { }

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  async getLatestEpisodes(page: number, token) {
    return new Promise<any>((resolve) => {
      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(this.domain + "/api/v1/episodes/?ordering=-fecha&page=" + page, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetLatestEpisodes) {
            this.amrGetLatestEpisodes = true;
            const interval = setInterval(() => {
              this.getLatestEpisodes(page, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetLatestEpisodes = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getAnimeDetail(animeid: number, token) : Promise<any> {
    return new Promise<any>((resolve) => {
      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(this.domain + "/api/v1/animes/" + animeid + "/", {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimeDetail) {
            this.amrGetAnimeDetail = true;
            const interval = setInterval(() => {
              this.getAnimeDetail(animeid, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimeDetail = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getAnimes(page: number, ordering: string, shuffle: boolean, token: string) {
    return new Promise<any>((resolve) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?estado=&estreno=&idioma=1&page=" + page + "&random="+shuffle
      } else {
        url = this.domain + "/api/v1/animes/?estado=&estreno=&idioma=1&ordering="+ordering+"&page=" + page;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimes) {
            this.amrGetAnimes = true;
            const interval = setInterval(() => {
              this.getAnimes(page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimes = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getLatino(page: number, ordering: string, shuffle: boolean, token: string) {
    return new Promise<any>((resolve) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?idioma=2&tipo=1&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&idioma=2&tipo=1&page=" + page;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetLatino) {
            this.amrGetLatino = true;
            const interval = setInterval(() => {
              this.getLatino(page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetLatino = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getSeries(page: number, ordering: string, shuffle: boolean, token: string) {
    return new Promise<any>((resolve) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?tipo=9&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&tipo=9&page=" + page;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetSeries) {
            this.amrGetSeries = true;
            const interval = setInterval(() => {
              this.getSeries(page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetSeries = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getInBroadcast(page: number, ordering: string, shuffle: boolean, token: string) {
    return new Promise<any>((resolve) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?estado=2&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&estado=2&page=" + page;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetInBroadcast) {
            this.amrGetInBroadcast = true;
            const interval = setInterval(() => {
              this.getInBroadcast(page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetInBroadcast = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getRandomAnimes(page: number, token) : Promise<any> {
    return new Promise((resolve) => {
      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(this.domain + "/api/v1/animes/?random=true&page=" + page, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetRandomAnimes) {
            this.amrGetRandomAnimes = true;
            const interval = setInterval(() => {
              this.getRandomAnimes(page, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetRandomAnimes = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getNextToSee(token: string): Promise<any> {
    return new Promise((resolve) => {
      fetch(this.domain + "/api/v1/next-to-see/", {
        method: 'GET',
        headers: {
          'Authorization': 'Token ' + token
        }
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          console.log("error");
          if (!this.amrGetNextToSee) {
            this.amrGetNextToSee = true;
            const interval = setInterval(() => {
              this.getNextToSee(token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetNextToSee = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async findAnime(query: string, page: number, token) {
    return new Promise<any>((resolve) => {
      let headers = {};
      if (token != "") {
        headers = {
          Authorization: 'Token ' + token
        }
      }
      fetch(this.domain + "/api/v1/animes/?search=" + query + "&ordering=-agregado&page=" + page, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrFindAnime) {
            this.amrFindAnime = true;
            const interval = setInterval(() => {
              this.findAnime(query, page, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrFindAnime = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  // async getAnimeDetail(slug: string) {
  //   return new Promise((resolve, reject) => {
  //     fetch(this.host + "anime-detail/" + slug, {
  //       method: 'GET'
  //     })
  //       .then(response => response.json(), error => console.log(error))
  //       .then(data => {
  //         resolve(data);
  //       }
  //         , error => {
  //           reject(error);
  //         });
  //   });

  // }


  // ----------------------------------------- AQUI QUEDE CON EL AMR -----------------------------------------

  async getEpisodeDetail(episode: any) {

    const isLogged = await this.localStorage.getLogged();

    return new Promise<any>(async (resolve) => {

      await fetch(this.oldHost + "episode-detail/" + episode.slug, {
        method: 'GET'
      })
        .then(response => response.json())
        .then(async data => {

          if (!isLogged) {
            resolve(data);
          } else {
            const user = await this.localStorage.getUser();
            if (user.email == environment.googleTesterAccount) {
              resolve([]);
            } else {
              resolve(data);
            }
          }

        }).catch(() => {
          if (!this.amrGetEpisodeDetail) {
            this.amrGetEpisodeDetail = true;
            const interval = setInterval(() => {
              this.getEpisodeDetail(episode).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetEpisodeDetail = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async signin(email: string, password: string): Promise<any> {

    return new Promise<any>((resolve) => {
      const url: string = this.domain + "/api/v1/signin/?username=" + email + "&password=" + password + "&auth_token=" + this.backendAuthToken;
      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json"
        }
      })
        .then(async response => {
          const data = await response.json();

          if (response.status == 200) {
            resolve({
              logged: true,
              user: data.user
            });
          
          } else {
            resolve({
              logged: false,
              message: data.error
            });
          }

        }).catch(() => {
          if (!this.amrSignin) {
            this.amrSignin = true;
            const interval = setInterval(() => {
              this.signin(email, password).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrSignin = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async socialSignin(access_token: string, provider: string): Promise<any> {
    const loader = await this.utils.createIonicLoader("Iniciando sesión con "+provider+"...");
    await loader.present();

    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/rest-auth/google/";
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: access_token
        })
      })
        .then(async response => {
          if (response.ok) {
            const data = await response.json();
            resolve(data)
          } else {
            reject(response);
          }
          loader.dismiss();

        }).catch((error) => {
          loader.dismiss();
          if (!this.amrSocialSignin) {
            this.amrSocialSignin = true;
            const interval = setInterval(() => {
              this.socialSignin(access_token, provider).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrSocialSignin = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async getGooglePeopleInfo(access_token: string, personField: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      const api_key = environment.googlePeopleApiKey;

      const url: string = "https://people.googleapis.com/v1/people/me?personFields="+ personField + "&key=" + api_key;
      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + access_token
        }
      })
        .then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }
          , error => {
            reject(error);
          });
    });
  }
  
  confirmThirteenAgeCoppaCompliant(token: string): Promise<any> {
    return new Promise<any>(async (resolve) => {

      const loader = await this.utils.createIonicLoader("Confirmando...");
      await loader.present();

      const url: string = this.domain + "/api/v1/change-coppa-compliance/";

      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          thirteen_age_coppa_compliant: true
        })
      })
        .then(response => response.json())
        .then(data => {
          loader.dismiss();
          resolve(data);

        }).catch(() => {
          if (!this.amrConfirmThirteenAgeCoppaCompliant) {
            this.amrConfirmThirteenAgeCoppaCompliant = true;
            const interval = setInterval(() => {
              this.confirmThirteenAgeCoppaCompliant(token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrConfirmThirteenAgeCoppaCompliant = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }


  async signup(username: string, email:string, password: string) {
    const loader = await this.utils.createIonicLoader("Creando tu cuenta...");
    await loader.present();

    return new Promise((resolve) => {
      const url: string = this.domain + "/api/v1/signup/";
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          thirteen_age_coppa_compliant: true,
          auth_token: this.backendAuthToken
        })
      })
        .then(async response => {
          const data = await response.json();

          if (response.status == 201) {
            resolve({
              registered: true,
              message: "Cuenta creada con éxito"
            });
          } else {
            resolve({
              registered: false,
              message: data.error
            });
          }
          loader.dismiss();

        }).catch(() => {
          if (!this.amrSignup) {
            this.amrSignup = true;
            const interval = setInterval(() => {
              this.signup(username, email, password).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrSignup = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async recoverPassword(email: string) {
    const loader = await this.utils.createIonicLoader("Enviando correo de recuperación...");
    await loader.present();

    return new Promise((resolve) => {
      const url: string = this.oldHost + "forgot-password/";

      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          email: email
        }),
      }).then(response => response.json())
      .then(data => {
        loader.dismiss();
        resolve(data);
        
      }).catch(() => {
        if (!this.amrRecoverPassword) {
          this.amrRecoverPassword = true;
          const interval = setInterval(() => {
            this.recoverPassword(email).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrRecoverPassword = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  async getFavoriteAnimes(token: string, page: number) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/fav_animes/" + "?ordering=-fecha&page=" + page;
      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token
        }
      })
      .then(async response => {

        if (response.status == 403) {
          const data = await response.json();
          reject(data);

          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          const data = await response.json();
          resolve(data);
        }

      }).catch(() => {
        if (!this.amrGetFavoriteAnimes) {
          this.amrGetFavoriteAnimes = true;
          const interval = setInterval(() => {
            this.getFavoriteAnimes(token, page).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetFavoriteAnimes = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  async checkFavoriteAnime(token: string, animeId: number) {
    return new Promise<any>((resolve) => {
      const url: string = this.domain + "/api/v1/fav_animes/?anime=" + animeId;
      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token
        }
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrCheckFavoriteAnime) {
            this.amrCheckFavoriteAnime = true;
            const interval = setInterval(() => {
              this.checkFavoriteAnime(token, animeId).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrCheckFavoriteAnime = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async toggleFavoriteAnime(token: string, animeId: number) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/fav_animes/";
      fetch(url, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          anime: animeId
        })
      }).then(async response => {
        if (response.status == 201) {
          resolve(true);
        } else if (response.status == 200) {
          resolve(true)
        } else if (response.status == 403) {
          const data = await response.json();
          reject(data);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          resolve(false);
        }

      }).catch(() => {
        if (!this.amrToggleFavoriteAnime) {
          this.amrToggleFavoriteAnime = true;
          const interval = setInterval(() => {
            this.toggleFavoriteAnime(token, animeId).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrToggleFavoriteAnime = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  checkSeenEpisodes(token: string, animeId: number) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/episodios_vistos/?anime=" + animeId;
      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token
        }
      }).then(async response => {
        if (response.status == 403) {
          const data = await response.json();
          reject(data);

          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          const data = await response.json();
          resolve(data);
        }
      })
        .then(data => {
          resolve(data);
          
        }).catch(() => {
          if (!this.amrCheckSeenEpisodes) {
            this.amrCheckSeenEpisodes = true;
            const interval = setInterval(() => {
              this.checkSeenEpisodes(token, animeId).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrCheckSeenEpisodes = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  toggleSeenEpisode(token: string, episodeId: number) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/episodios_vistos/";
      fetch(url, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          episodio: episodeId
        })
      }).then(async response => {
        if (response.status == 201) {
          resolve(true);
          this.sharingService.emitSeenEpisodeChange(true);
        } else if (response.status == 200) {
          resolve(true)
          this.sharingService.emitSeenEpisodeChange(true);
        } else if (response.status == 204) {
          resolve(false);
          this.sharingService.emitSeenEpisodeChange(true);

        } else if (response.status == 403) {
          const data = await response.json();
          reject(data);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        
        } else {
          reject(response);
        }

      }).catch(() => {
        if (!this.amrToggleSeenEpisode) {
          this.amrToggleSeenEpisode = true;
          const interval = setInterval(() => {
            this.toggleSeenEpisode(token, episodeId).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrToggleSeenEpisode = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  getUsers(token: string, page: number, sortName: string, search: string): Promise<any> {
    return new Promise<any>((resolve) => {
      
      if (sortName == "profile-last-updated" || sortName == "more-reports" || sortName == "less-reports") {
        var url: string = this.domain + "/api/v1/users/?" + sortName;
      } else {
        var url: string = this.domain + "/api/v1/users/?page=" + page + "&ordering=" + sortName;
      }

      if (search != "") {
        url = url + "&search=" + search;
      }

      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
          "Authorization": "Token " + token
        }
      }).then(response => response.json())
        .then(data => {
          resolve(data);

        }).catch(() => {
          if (!this.amrGetUsers) {
            this.amrGetUsers = true;
            const interval = setInterval(() => {
              this.getUsers(token, page, sortName, search).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetUsers = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  async purgeSession() {
    this.localStorage.removeUser();
    this.localStorage.setLogged(false);
    this.localStorage.setGuest(false);


    const googleLogin = await this.localStorage.getGoogleLogin();
    if (googleLogin) {
      GoogleAuth.signOut().then(() => {
        this.localStorage.setGoogleLogin(false);
      }).catch(error => {
        console.log(error);
      });
    }

    // FirebaseMessaging.removeAllListeners();
    // FirebaseMessaging.deleteToken();
  }

  // Se usa para obtener recursivamente todos los resultados de las páginas de un recurso
  getRecursiveData(url: string, results: any) : Promise<any> {

    return new Promise<any>((resolve) => {

      fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json"
        }
      })
      .then(response => response.json(), error => console.log(error))
      .then(data => {
        results = results.concat(data.results);
        if (data.next != null) {
          this.getRecursiveData(data.next, results).then(data => {
            resolve(data);
          }).catch(() => {

            if (url.includes("/api/v1/genres/")) {
              if (!this.amrGetRecursiveDataGenres) {
                this.amrGetRecursiveDataGenres = true;
                const interval = setInterval(() => {
                  this.getRecursiveData(url, results).then(data => {
                    resolve(data);
                    clearInterval(interval);
                    this.amrGetRecursiveDataGenres = false;
                  }).catch(() => {
                    clearInterval(interval);
                  });
                }, 3000);
              }
            } else if (url.includes("/api/v1/types/")) {
              if (!this.amrGetRecursiveDataTypes) {
                this.amrGetRecursiveDataTypes = true;
                const interval = setInterval(() => {
                  this.getRecursiveData(url, results).then(data => {
                    resolve(data);
                    clearInterval(interval);
                    this.amrGetRecursiveDataTypes = false;
                  }).catch(() => {
                    clearInterval(interval);
                  });
                }, 3000);
              }
            } else if (url.includes("/api/v1/status/")) {
              if (!this.amrGetRecursiveDataStatus) {
                this.amrGetRecursiveDataStatus = true;
                const interval = setInterval(() => {
                  this.getRecursiveData(url, results).then(data => {
                    resolve(data);
                    clearInterval(interval);
                    this.amrGetRecursiveDataStatus = false;
                  }).catch(() => {
                    clearInterval(interval);
                  });
                }, 3000);
              }

            } else if (url.includes("/api/v1/languages/")) {
              if (!this.amrGetRecursiveDataLanguages) {
                this.amrGetRecursiveDataLanguages = true;
                const interval = setInterval(() => {
                  this.getRecursiveData(url, results).then(data => {
                    resolve(data);
                    clearInterval(interval);
                    this.amrGetRecursiveDataLanguages = false;
                  }).catch(() => {
                    clearInterval(interval);
                  });
                }, 3000);
              }
            }
          });
        } else {
          resolve(results);
        }

      }).catch(() => {
        if (url.includes("/api/v1/genres/")) {
          if (!this.amrGetRecursiveDataGenres) {
            this.amrGetRecursiveDataGenres = true;
            const interval = setInterval(() => {
              this.getRecursiveData(url, results).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetRecursiveDataGenres = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        } else if (url.includes("/api/v1/types/")) {
          if (!this.amrGetRecursiveDataTypes) {
            this.amrGetRecursiveDataTypes = true;
            const interval = setInterval(() => {
              this.getRecursiveData(url, results).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetRecursiveDataTypes = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        } else if (url.includes("/api/v1/status/")) {
          if (!this.amrGetRecursiveDataStatus) {
            this.amrGetRecursiveDataStatus = true;
            const interval = setInterval(() => {
              this.getRecursiveData(url, results).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetRecursiveDataStatus = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }

        } else if (url.includes("/api/v1/languages/")) {
          if (!this.amrGetRecursiveDataLanguages) {
            this.amrGetRecursiveDataLanguages = true;
            const interval = setInterval(() => {
              this.getRecursiveData(url, results).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetRecursiveDataLanguages = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        }
      });
    });
  }

  getAnimesByGenre(genreId: number, page: number, ordering: string, shuffle: boolean, token: string) : Promise<any> {
    return new Promise<any>((resolve) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?generos=" + genreId + "&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&generos=" + genreId + "&page=" + page + "&random="+shuffle;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Accept: "application/json",
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);

        }).catch(() => {
          if (!this.amrGetAnimesByGenre) {
            this.amrGetAnimesByGenre = true;
            const interval = setInterval(() => {
              this.getAnimesByGenre(genreId, page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimesByGenre = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getAnimesByType(typeId: number, page: number, ordering: string, shuffle: boolean, token: string) : Promise<any> {
    return new Promise<any>((resolve) => {

      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?tipo=" + typeId + "&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&tipo=" + typeId + "&page=" + page;
      }

      let headers = {};
      if (token != "") {
        headers = {
          Accept: "application/json",
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimesByType) {
            this.amrGetAnimesByType = true;
            const interval = setInterval(() => {
              this.getAnimesByType(typeId, page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimesByType = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getAnimesByStatus(statusId: number, page: number, ordering: string, shuffle: boolean, token: string) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?estado=" + statusId + "&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&estado=" + statusId + "&page=" + page;
      }
      let headers = {};
      if (token != "") {
        headers = {
          Accept: "application/json",
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimesByStatus) {
            this.amrGetAnimesByStatus = true;
            const interval = setInterval(() => {
              this.getAnimesByStatus(statusId, page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimesByStatus = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getAnimesByLanguage(idiomaId: number, page: number, ordering: string, shuffle: boolean, token: string) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?idioma=" + idiomaId + "&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&idioma=" + idiomaId + "&page=" + page;
      }
      let headers = {};
      if (token != "") {
        headers = {
          Accept: "application/json",
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimesByLang) {
            this.amrGetAnimesByLang = true;
            const interval = setInterval(() => {
              this.getAnimesByLanguage(idiomaId, page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimesByLang = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  getAnimesByYear(year: string, page: number, ordering: string, shuffle: boolean, token: string) : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var url: string = "";
      if (shuffle) {
        url = this.domain + "/api/v1/animes/?estreno=" + year + "&page=" + page + "&random="+shuffle;
      } else {
        url = this.domain + "/api/v1/animes/?ordering="+ordering+"&estreno=" + year + "&page=" + page;
      }
      let headers = {};
      if (token != "") {
        headers = {
          Accept: "application/json",
          Authorization: 'Token ' + token
        }
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetAnimesByYear) {
            this.amrGetAnimesByYear = true;
            const interval = setInterval(() => {
              this.getAnimesByYear(year, page, ordering, shuffle, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetAnimesByYear = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  checkAndroidVersion() : Promise<any> {
    return new Promise<any>((resolve) => {
      fetch(this.domain + "/api/v1/check-android-app-version/?hash="+this.backendAndroidAppHash, {
        method: 'GET'
      }).then(response => response.json(), error => console.log(error))
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrCheckAndroidVersion) {
            this.amrCheckAndroidVersion = true;
            const interval = setInterval(() => {
              this.checkAndroidVersion().then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrCheckAndroidVersion = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

  public getSeenEpisodesHistory(page: number, ordering: string, token: string) {
    return new Promise<any>((resolve) => {
      const url = this.domain + "/api/v1/seen-episode-time/?ordering="+ordering+"&page=" + page;

      let headers = {
        Authorization: 'Token ' + token
      }
      fetch(url, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(data => {
          resolve(data);
        }).catch(() => {
          if (!this.amrGetSeenEpisodesHistory) {
            this.amrGetSeenEpisodesHistory = true;
            const interval = setInterval(() => {
              this.getSeenEpisodesHistory(page, ordering, token).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetSeenEpisodesHistory = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
    });
  }

}
