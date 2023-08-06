import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { PreferencesService } from '../../preferences/preferences.service';

@Injectable({
  providedIn: 'root'
})
export class AnimeuiService {

  public domain = environment.root_url;

  constructor(public localStorage: PreferencesService) { }

  async getEmbeds(anime_name: string, ep_number: number) {
    
    return new Promise<any>(async (resolve, reject) => {

      const isLogged = await this.localStorage.getLogged();
      let name = anime_name.replace(/ /g, "+").toLowerCase();

      const options: HttpOptions = {
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: "https://animeui.com/anime/directory?title=" + name
        // },
        url: "https://animeui.com/anime/directory?title=" + name,
        readTimeout: 10000,
        connectTimeout: 10000
      }

      await CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        
        const anime_links = html.querySelectorAll(".latest-animes a");
        //busca el anime_link que contenga el nombre del anime
        let anime_link = "";
        for (let link of anime_links) {
          //delete the first and last space of the title
          const remote_title = link.querySelector(".anime-title").innerHTML.replace(/^\s+|\s+$/g, "");
          if (remote_title.toLowerCase() == anime_name.toLowerCase()) {
            anime_link = link['href'];
            break;
          }
        }
        
        //crea episode_link reemplazando el ultimo / por - + episodio-ep_number
        let episode_link = "https://animeui.com" + anime_link.replace("/anime/", "/watch/").replace(/\/$/, "") + "-" + ep_number;
        episode_link = episode_link.replace("http://localhost:8100", "").replace("http://localhost", "").replace("capacitor://localhost", "");
        console.log(episode_link)
        const ep_request_options = {
          // url: this.domain + "/api/cors/",
          // data: {
          //   url: episode_link
          // },
          url: episode_link,
          readTimeout: 10000,
          connectTimeout: 10000
        }

        await CapacitorHttp.get(ep_request_options).then(async (response) => {

          const content = response.data;
          const parser = new DOMParser();
          const html = parser.parseFromString(content, "text/html");
          console.log("Episode Html ", html)
          
          const select_options = html.querySelectorAll(".server-name");
          const mirrors = [];
          for (let s of select_options) {
            //decode base64 value
            if (s.getAttribute('onclick') != "") {

              //extrae el iframe del value, controla el error cuando no hay iframe
              try {
                const option_name = s['innerText'];
                const onclick = s.getAttribute('onclick');
                const regex = /switchServer\('([^']*)', '([^']*)', ([^)]*)\)/;
                const matches = onclick.match(regex);
                const serverUrl = matches[1];
		            const serverHash = matches[2];
                const url = serverUrl + "/" + serverHash;

                mirrors.push({
                  embed: option_name,
                  url: url
                });
              } catch (error) {
                console.log(error);
              }
              
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
