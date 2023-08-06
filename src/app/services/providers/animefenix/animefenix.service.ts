import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { PreferencesService } from '../../preferences/preferences.service';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AnimefenixService {

  public domain: string = environment.root_url;
  constructor(public localStorage: PreferencesService) { }

  getEmbeds(episode: any): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {

      const isLogged = await this.localStorage.getLogged();

      if (episode.anime.animefenix_slug == null) {
        var slug = this.clearSlugAnimeFenix(episode.anime.nombre, episode.anime.idioma, episode.slug);
      } else {
        var slug = episode.anime.animefenix_slug + "-" + episode.numero;
      }

      //get actual year in this format: 2021
      const year = new Date().getFullYear();
      const month = ("0" + (new Date().getMonth() + 1)).slice(-2);
      const day = ("0" + new Date().getDate()).slice(-2);
      const full = year + month + day;

      if (slug.includes("naruto-shippuden-hd")) {
        slug = slug.replace("naruto-shippuden-hd", "naruto-shippuden");
      }
      
      const url = "https://web.archive.org/web/"+full+"185723/https://animefenix.tv/ver/" + slug;
      console.log("url: " + url);
  
      const options = {
        url: url,
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      let result = [];
  
      await CapacitorHttp.get(options).then(async data => {
        const content = data.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
  
        //get all scripts
        const scripts = html.getElementsByTagName("script");
  
        for (let code of scripts) {
          if (code.innerText.includes("var tabsArray")) {
            var script = code;
            break;
          }
        }
  
        try {
          const tabsArray = script.innerText.split("tabsArray[").slice(1);
  
          const iframes = tabsArray.map(tab => {
            var a = tab.split("src='")[1];
            var b = a.split("'")[0];
            return b.replaceAll("amp;", "");
          }).filter(iframe => iframe !== undefined);
  
          iframes.forEach(iframe => {
            const playerId = iframe.split("player=")[1].split("&")[0];
            const code = iframe.split("code=")[1].split("&thumb")[0];
  
            switch (playerId) {
              case "15":
                result.push({
                  embed: "Mega",
                  url: decodeURIComponent("https://mega.nz/embed/" + code)
                });
                break;
  
              case "6":
                result.push({
                  embed: "YUServer",
                  url: decodeURIComponent("https://www.yourupload.com/embed/" + code)
                });
                break;
  
              case "21":
                result.push({
                  embed: "BurstCloud",
                  url: decodeURIComponent("https://www.burstcloud.co/embed/" + code)
                });
                break;
  
              case "12":
                result.push({
                  embed: "RUServer",
                  url: decodeURIComponent("https://ok.ru/videoembed/" + code)
                });
                break;
  
              case "22":
                result.push({
                  embed: "Fireload",
                  url: decodeURIComponent("https://" + code)
                });
                break;
  
              case "9":
                result.push({
                  embed: "Amazon",
                  url: decodeURIComponent("https://www.animefenix.tv/stream/amz.php?v=" + code)
                });
                break;
  
              case "11":
                result.push({
                  embed: "Amazon(ES)",
                  url: decodeURIComponent("https://www.animefenix.tv/stream/amz.php?v=" + code + "&ext=es")
                });
                break;
  
              case "2":
                result.push({
                  embed: "FEServer",
                  url: decodeURIComponent("https://www.fembed.com/v/" + code)
                });
                break;
  
              case "3":
                result.push({
                  embed: "Mp4Upload",
                  url: decodeURIComponent("https://www.mp4upload.com/embed-" + code + ".html")
                });
                break;
  
              case "4":
                result.push({
                  embed: "SendVid",
                  url: decodeURIComponent("https://sendvid.com/embed/" + code)
                });
                break;
  
              case "19":
                result.push({
                  embed: "ViDea",
                  url: decodeURIComponent("//videa.hu/player?v=" + code)
                });
                break;
  
              case "17":
                result.push({
                  embed: "TeraBox",
                  url: decodeURIComponent("https://terabox.com/sharing/embed?surl=" + code)
                });
                break;
  
              case "23":
                result.push({
                  embed: "StreamSB",
                  url: decodeURIComponent("https://streamsb.net/embed/" + code)
                })

              case "24":
                result.push({
                  embed: "StreamHide",
                  url: decodeURIComponent("https://streamhide.to/e/" + code)
                });

                case "16":
                  result.push({
                    embed: "StreamWish",
                    url: decodeURIComponent("https://streamwish.to/e/" + code)
                  });
  
              default:
                break;
            }
  
          });

          if (!isLogged) {
            resolve(result);
          } else {
            const user = await this.localStorage.getUser();
            if (user.email == environment.googleTesterAccount) {
              resolve([]);
            } else {
              resolve(result);
            }
          }
        } catch (error) {
          reject(error);
        }
  
      }).catch(error => {
        reject(error);
        console.log(error);
      });
    })
  }

  clearSlugAnimeFenix(anime_name: string, anime_lang: string, slug: string): string {
    anime_name = anime_name.replaceAll(":", "")
        .replaceAll(",", "")
        .replaceAll(".", "")
        .replaceAll("_", "")

    if (anime_name.includes("-") && !anime_name.includes(" - ")) {

      const position = anime_name.indexOf("-");
      slug = [slug.slice(0, position), "-", slug.slice(position)].join('');
    }

    if (anime_name.includes("/") && !anime_name.includes(" / ")) {

      const position = anime_name.indexOf("/");
      slug = [slug.slice(0, position), "-", slug.slice(position)].join('');
    }

    if (anime_lang == "Latino") {
      //add -latino before the last - in the url_path
      const position_line = slug.lastIndexOf("-");
      slug = [slug.slice(0, position_line), "-latino", slug.slice(position_line)].join('');
  }
    return slug;
  }
}
