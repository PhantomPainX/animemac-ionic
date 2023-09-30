import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { PreferencesService } from '../../preferences/preferences.service';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AnimeflvService {

  public domain: string = environment.root_url;
  
  constructor(public localStorage: PreferencesService) { }

  async getEmbeds(anime_name: string, ep_number: number) {

    return new Promise<any>(async (resolve, reject) => {

      const animeflv_url = "https://animeflv.ws";

      const isLogged = await this.localStorage.getLogged();
      let name = anime_name.replace(/ /g, "+").toLowerCase();

      const options = {
        url: "https://animeflv.ws/browse?q=" + name,
        // url: "https://animemac.net/api/cors/",
        // data: {
        //   url: "https://animeflv.ws/browse?q=" + name,
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      }

      await CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        
        const anime_links = html.querySelectorAll("article.Anime.alt.B");
        let anime_link = "";
        for (let link of anime_links) {
          //check if the anime name is the same
          if (link.querySelector("a").querySelector("h3").innerText.toLowerCase() == anime_name.toLowerCase()) {
            anime_link = link.querySelector("a").href.replace("http://localhost", animeflv_url).replace("capacitor://localhost", animeflv_url);
            break;
          }
        }

        const episode_link = anime_link.replace("ws/anime", "ws") + "-" + ep_number;
        const ep_request_options = {
          url: episode_link,
          readTimeout: 10000,
          connectTimeout: 10000
        }

        await CapacitorHttp.get(ep_request_options).then(async (response) => {

          const content = response.data;
          const parser = new DOMParser();
          const html = parser.parseFromString(content, "text/html");
          const li = html.querySelector("ul.CapiTnv.nav.nav-pills.anime_muti_link").querySelectorAll("li");
          
          const mirrors = [];
          for (let element of li) {
            if (!element.dataset.video.includes("animeid.to")) {
              let name = element.dataset.video.split("/")[2];
              mirrors.push({
                embed: name,
                url: element.dataset.video
              });
            }
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
      }).catch(error => {
        reject(error);
      });
    });
  }

}
