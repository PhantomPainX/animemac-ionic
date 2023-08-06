import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { PreferencesService } from '../../preferences/preferences.service';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AnimemeowService {

  constructor(public localStorage: PreferencesService) { }

  async getEmbeds(anime_name: string, ep_number: number) {

    return new Promise<any>(async (resolve, reject) => {

      const animemeow_url = "https://animemeow.xyz";

      const isLogged = await this.localStorage.getLogged();
      let name = anime_name.replace(/ /g, "+").toLowerCase();

      const options = {
        url: animemeow_url + "/api/v1/animes/?search=" + name,
        readTimeout: 10000,
        connectTimeout: 10000
      }

      await CapacitorHttp.get(options).then(async (response) => {

        const results = response.data.results;

        let exact_match = false;
        let exact_result = null;
        for (let result of results) {
          if (result.nombre.toLowerCase() == anime_name.toLowerCase()) {
            exact_match = true;
            exact_result = result;
            break;
          }
        }

        if (exact_match) {
          let episode = exact_result.episodios[ep_number - 1];

          const episode_link = animemeow_url + "/mobile/api/v1/3415432348869182/episode-detail/" + episode.slug;
          const ep_request_options = {
            url: episode_link,
            readTimeout: 10000,
            connectTimeout: 10000
          }
          await CapacitorHttp.get(ep_request_options).then(async (response) => {

            const mirrors = [];
            for (let mirror of response.data) {
              mirrors.push({
                embed: mirror.embed,
                url: mirror.url
              });
            }

            if (!isLogged) {
              resolve(mirrors);
            } else {
              const user = await this.localStorage.getUser();
              if (user.email == environment.googleTesterAccount) {
                resolve([]);
              } else {
                resolve(mirrors);
              }
            }

          }).catch(error => {
            reject(error);
          });
        } else {
          reject("No exact match");
        }
        

        // const episode_link = anime_link.replace("vc/anime", "vc") + "-" + ep_number;
        // const ep_request_options = {
        //   url: episode_link,
        //   readTimeout: 10000,
        //   connectTimeout: 10000
        // }

        // await CapacitorHttp.get(ep_request_options).then(async (response) => {

        //   const content = response.data;
        //   const parser = new DOMParser();
        //   const html = parser.parseFromString(content, "text/html");
        //   const li = html.querySelector("ul.CapiTnv.nav.nav-pills.anime_muti_link").querySelectorAll("li");
          
        //   const mirrors = [];
        //   for (let element of li) {
        //     if (!element.dataset.video.includes("animeid.to")) {
        //       let name = element.dataset.video.split("/")[2];
        //       mirrors.push({
        //         embed: name,
        //         url: element.dataset.video
        //       });
        //     }
        //   }
        //   if (!isLogged) {
        //     resolve(mirrors);
        //   } else {
        //     const user = await this.localStorage.getUser();
        //     if (user.email == environment.googleTesterAccount) {
        //       resolve([]);
        //     } else {
        //       resolve(mirrors);
        //     }
        //   }

        // }).catch(error => {
        //   reject(error);
        // });
      }).catch(error => {
        reject(error);
      });
    });
  }
}
