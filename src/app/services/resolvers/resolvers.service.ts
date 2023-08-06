import { Injectable } from '@angular/core';
import { UtilsService } from '../utils.service';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { environment } from 'src/environments/environment.prod';
import { StringBuilder } from './string-builder';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class ResolversService {

  public obfuscate: any;
  public domain: string = environment.root_url;

  constructor(public utils: UtilsService, public iAb: InAppBrowser) {
  }


  async checkVideoAvailability(raw_url: string, referer: string) {
    const loader = await this.utils.createIonicLoader("Validando...");
    await loader.present();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        loader.dismiss();
        resolve(true);
      }, 2000);
    });
  }

  async fembedResolver(url_orig: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    let url = url_orig.replace("fembed.com", "vanfem.com").replace("/v/", "/api/source/");

    return new Promise((resolve, reject) => {
      //hacer una peticion a la url con el plugin cordova-plugin-http con post 

      const options: HttpOptions = {
        url: url,
        headers: { 
          'Content-Type': 'application/json',
          'Referer': url
        }
      };

      CapacitorHttp.post(options).then(res => {
        const mVideos = res.data.data; //bruh
        var videos = [];
        if (!Array.isArray(mVideos)) {
          reject("No se encontraron videos");
          loader.dismiss();
          return false;
        }

        for (let video of mVideos) {
          videos.push({
            'label': video.label,
            'file': video.file,
            'headers': {
              Referer: url
            },
            'kind': "video"
          });
        }
        console.log("FEMBED VIDEOS: " + JSON.stringify(videos));
        loader.dismiss();
        resolve(videos);

      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });
  }

  async uqloadResolver(urlxd: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {

      const options: HttpOptions = {
        url: urlxd,
        headers: {
          'Content-Type': 'video/mp4',
          'Referer': urlxd
        },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const html = data.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        let scripts = doc.querySelectorAll('script');
        let videoLink = '';
        scripts.forEach(script => {
          let scriptText = script.innerText;
          if (scriptText.includes("var player = new Clappr.Player")) {
            videoLink = scriptText.split('\"')[1];
          }
        });
        var url = videoLink;
        const document = [{
          'label': 'HD',
          'file': url,
          'headers': {
            Referer: urlxd
          },
          'kind': "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async youruploadResolver(url: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise(async (resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        headers: {
          'Content-Type': 'video/mp4',
          'Referer': url
        },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const html = data.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        let scripts = doc.querySelectorAll('script');
        let scriptWithVideo = '';
        for (let script of scripts) {
          let scriptText = script.innerText;
          if (scriptText.includes("var jwplayerOptions")) {
            scriptWithVideo = scriptText;
          }
        }
        const array = scriptWithVideo.split('\'');
        let vid = array.filter(item => item.includes(".mp4"));
        if (vid.length == 0) {
          loader.dismiss();
          reject("No se encontraron videos");
          return;
        }
        const document = [{
          'label': 'Normal',
          'file': vid[0],
          'headers': {
            Referer: url
          },
          'kind': "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async okruResolver(url: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const html = data.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        var okData = doc.querySelector('div[data-module=\"OKVideo\"');
        //get data-options of div
        var okDataOptions = okData.getAttribute('data-options');
        var jsonOptions = JSON.parse(okDataOptions);
        var metadata = jsonOptions.flashvars.metadata;
        var formattedMeta = JSON.parse(metadata);
        var mVideos = formattedMeta.videos;
        var videos = [];
        mVideos.forEach(video => {
          video.name = video.name.toLowerCase()
            .replace('mobile', '144p')
            .replace('lowest', '240p')
            .replace('low', '360p')
            .replace('sd', '480p')
            .replace('hd', '720p')
            .replace('full', '1080p')
            .replace('quad', '1440p')
            .replace('ultra', '4K');

          videos.push({
            'label': video.name,
            'file': video.url,
            'headers': {
              Referer: url
            },
            'kind': "video"
          });
        });

        const document = videos;
        loader.dismiss();
        resolve(document);
      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async mailRuResolver(url: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {

      let urlFix = url.replace('https://my.mail.ru/video/embed/', '');
      // urlFix = urlFix.substring(0, urlFix.indexOf('#'));
      const final_url = "https://my.mail.ru/+/video/meta/" + urlFix;

      const options: HttpOptions = {
        url: final_url,
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const json = data.data;
        let videos = [];
        json.videos.forEach(video => {
          videos.push({
            'label': video.key,
            'file': "https:" + video.url,
            'headers': {
              Referer: url
            },
            'kind': "video"
          });
        });

        const document = videos;
        loader.dismiss();
        resolve(document);
      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async aFenixResolver(url: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        headers: {
          'Referer': url
        },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(res => {
        console.log("AFENIX: ",res);

        const content = res.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        let scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
          let scriptText = script.innerText;
          if (scriptText.includes("player.setup")) {
            //transform to json
            let json = scriptText.split('sources: ')[1];
            json = json.split('}]')[0] + "}]";
            var document = JSON.parse(json);

            document.forEach(video => {
              delete video.type;
              video.headers = {
                Referer: url
              },
              video.kind = "video"
            });

            //check if there is at least one "file" in document
            if (document.some(video => video.file)) {
              loader.dismiss();
              resolve(document);
              return;
            } else {
              loader.dismiss();
              reject("No videos found");
              return;
            }
          }
        });

      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      }).finally(() => {
        loader.dismiss();
      });
    });
  }

  async streamsbResolver(url: string) {
    let id = url.split('/').pop();
    if (id.includes('.html')) {
      id = id.split('.html').shift();
    }

    let hex_id = this.encodeStreamsbId(id);
    // console.log("url domain:" + new URL(window.location.href).origin);
    // console.log("user-agent" + navigator.userAgent);

    const final_url = (new URL(url).origin + "/375664356a494546326c4b797c7c6e756577776778623171737/" + hex_id).toLowerCase();

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        readTimeout: 10000,
        connectTimeout: 10000,
        headers: {
          'User-Agent': 'animemacsb',
        }
      };

      CapacitorHttp.get(options).then((data) => {
        
        const content = data.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        //create script, load to document and execute
        let script = doc.createElement('script');
        script.type = 'text/javascript';
        
        let scriptText = doc.createTextNode("var streamsb = {embed_data: {}};");
        script.appendChild(scriptText);
        doc.head.appendChild(script);
        //execute script in document
        let script2 = doc.createElement('script');
        script2.type = 'text/javascript';
        scriptText = doc.createTextNode(content);


        console.log("STREAMSB embed data: " + JSON.stringify(data));

        const options: HttpOptions = {
          url: final_url,
          readTimeout: 10000,
          connectTimeout: 10000,
          headers: {
            watchsb: 'sbstream',
            Referer: url,
            'User-Agent': 'animemacsb',
          }
        };
  
        CapacitorHttp.get(options).then(data => {
          console.log("STREAMSB data: " + JSON.stringify(data));
          const json = data.data;
          console.log("STREAMSB json: " + JSON.stringify(json));
          let videos = [];
          console.log("STREAMSB link: " + json.stream_data.file);
          videos.push({
            label: 'HD',
            file: json.stream_data.file,
            headers: {
              Referer: url,
              'User-Agent': 'animemacsb',
            },
            "kind": "video"
          });
  
          const document = videos;
          loader.dismiss();
          resolve(document);
        }).catch(err => {
          loader.dismiss();
          reject(err);
        });
      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async streamsbResolver2(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {

      const options: HttpOptions = {
        // url: url,
        url: this.domain + "/api/cors/",
        data: {
          url: url
        },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.post(options).then((data) => {
        
        const content = data.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        //add option that plays the video inmediatly and not open other new windows
        const browser = this.iAb.create(url, '_blank');
        browser.on('loadstop').subscribe(event => {
          browser.executeScript({ code: 'const links=document.getElementsByTagName("a");for(let i=0;i<links.length;i++)links[i].addEventListener("click",e=>{e.preventDefault()});' }).then(() => {
            console.log("window.open disabled");
          }).catch(err => {
            console.log("error disabling window.open");
          });
        });

      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  generateRandomString(length: number): string {
    const sb = new StringBuilder();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let j = 0; j < length; j++) {
      sb.append(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }

    return sb.toString();
  }

  private makeStreamsbId(): string {
    const sb = new StringBuilder();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for (let j = 0; j < 12; j++) {
      sb.append(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    
    return sb.toString();
  }
  private encodeStreamsbId(id: string): string {
    const code = `${this.makeStreamsbId()}||${id}||${this.makeStreamsbId()}||streamsb`;
    const sb = new StringBuilder();
    const arr = code.split('');
    
    for (let j = 0; j < arr.length; j++) {
      sb.append(arr[j].charCodeAt(0).toString(16));
    }
    
    return sb.toString();
  }

  async mp4uploadResolver(url: string) {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        //find the script that contains video/mp4
        const scripts = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
        let script = null;
        for (let s of scripts) {
          if (s.includes('video/mp4')) {
            script = s;
            console.log("MP4UPLOAD script: " + script);
            break;
          }
        }
        const match = script.match(/src:\s*"([^"]+)"/);
        const videoUrl = match ? match[1] : null;
        console.log("MP4UPLOAD videoUrl: " + videoUrl);

        let videos = [];
        videos.push({
          'label': 'HD',
          'file': videoUrl,
          'headers': {
            Referer: videoUrl
          },
          'kind': "video"
        });

        console.log("MP4UPLOAD: " + JSON.stringify(videos));

        const document = videos;
        loader.dismiss();
        resolve(document);

      }).catch(err => {
        loader.dismiss();
        reject(err);
      });
    });
  }

  async animeuiResolver(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        const dom = new DOMParser().parseFromString(content, "text/html");
        const scripts = dom.querySelectorAll('script');
        var eval_function = "";
        for (let script of scripts) {
          if (script.innerText.includes("function(p,a,c,k,e,d)")) {
            eval_function = script.innerText;
            break;
          }
        }

        CapacitorHttp.post({
          url: this.domain + "/api/v1/eval-unpack/",
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            eval: eval_function
          },
          readTimeout: 10000,
          connectTimeout: 10000
        }).then(res => {
          const data = res.data.eval;
          let json = data.split('sources: ')[1];
          json = json.split('}]')[0] + "}]";
          const parsed_json = JSON.parse(json);

          let videos = [];
          for (let video of parsed_json) {
            videos.push({
              label: video.label,
              file: video.file,
              headers: {
                Referer: video.file
              },
              kind: "video"
            });
          }

          const document = videos;
          console.log("ANIMEUI: " + JSON.stringify(document));
          loader.dismiss();
          resolve(document);
          
        }).catch(err => {
          reject(err);
          loader.dismiss();
        });


      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });

  }

  async streamtapeResolver(url: string): Promise<any> {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      if (url.includes("/e/")) {
        url = url.replace("/e/", "/v/");
      }

      const options: HttpOptions = {
        url: url,
        headers: {
          Referer: "https://streamtape.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36"
        },
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      await CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        var videoUrl = html.querySelector("#norobotlink").innerHTML;
        const scripts = html.querySelectorAll('script');
        const regex = /token=([a-zA-Z0-9_-]+)/;
        let token = "";
        for (let script of scripts) {
          if (script.innerHTML.includes("document.getElementById('norobotlink').innerHTML")) {
            token = regex.exec(script.innerHTML)[0];
            break;
          }
        }

        if (token != "") {
          videoUrl = videoUrl.replace(/token=[a-zA-Z0-9_-]+/, token);
        }

        let video = (videoUrl.replace("/streamtape", "https://streamtape") + "&stream=1").replace(/&amp;/g, "&");

        const document = [{
          label: "Normal",
          file: video,
          headers: {
            Referer: video
          },
          kind: "video"
        }];
        loader.dismiss();
        resolve(document);

      }).catch(error => {
        loader.dismiss();
        reject(error);
      });

    });

  }

  async jwplayerResolver(url: string): Promise<any> {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      // url is https://cdn.jwplayer.com/players/qBfxB8ny-R0YaOnjV extract qBfxB8ny
      const regex = /players\/([a-zA-Z0-9_-]+)/;
      const ids = regex.exec(url)[1];
      const playerid = ids.split("-")[0];
      console.log(playerid);

      const options: HttpOptions = {
        url: "https://content.jwplatform.com/v2/media/"+playerid,
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      await CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const sources = content.playlist[0].sources;
        let document = [];
        if (sources.length > 0) {
          for (let source of sources) {
            if (source.type == "video/mp4") {
              let label = "";
              if (!source.label) {
                label = "Normal";
              } else {
                label = source.label;
              }
              document.push({
                label: label,
                file: source.file,
                headers: {
                  Referer: url
                },
                kind: "video"
              });
            }
          }

          const tracks = content.playlist[0].tracks;
          if (tracks) {
            if (tracks.length > 0) {
              for (let track of tracks) {
                if (track.kind == "captions") {
                  document.push({
                    label: track.label,
                    file: track.file,
                    kind: track.kind
                  });
                }
              }
            }
          }
        } else {
          reject("No se encontraron videos");
        }

        loader.dismiss();
        resolve(document);

      }).catch(error => {
        loader.dismiss();
        reject(error);
      });

    });

  }

  async ironhentaiResolver(url: string): Promise<any> {
      
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: url
        // },
        headers: {
          "Referer": "https://ironhentai.com/",
        }
      }

      CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        const iframeSrc = html.querySelector("iframe").getAttribute("src");

        console.log("iframeSrc: " + JSON.stringify(iframeSrc));

        const options: HttpOptions = {
          url: iframeSrc,
          // url: this.domain + "/api/cors/",
          // data: {
          //   url: iframeSrc
          // },
          headers: {
            "Referer": "https://ironhentai.com/",
          }
        }

        CapacitorHttp.get(options).then(async (response) => {
          const content = response.data;
          const parser = new DOMParser();
          const html = parser.parseFromString(content, "text/html");
          console.log("HTML 2: ", html);

          // If PLUSIM is detected, then we need to get the video url from the iframe xd
          const iframe = html.querySelector("iframe");
          if (iframe) {
            const iframeSrc = iframe.getAttribute("src");
            if (iframeSrc) {

              //url is https://apu.animemovil2.com/embed2/?id=https://great-2.flsvr.com/hls/1/0w0acou2p5uuir/video.mp4/master.m3u8?v=8607005
              // get the id
              const video = iframeSrc.split("id=")[1];

              loader.dismiss();
              resolve([{
                label: "HD",
                file: video,
                headers: {
                  Referer: iframeSrc
                },
                kind: "video"
              }]);
              return;
            }
          }

          const scripts = html.querySelectorAll('script');
          let apiUrl = "";
          for (let script of scripts) {
            if (script.innerHTML.includes('{url:"//apu.animemovil2.com/api/')) {
              apiUrl = "https://apu.animemovil2.com/api/" + script.innerHTML.split('{url:"//apu.animemovil2.com/api/')[1].split('"')[0];
              console.log("APIUrl: " + apiUrl);
              break;
            }
          }
          if (apiUrl == "") {
            reject("No se encontraron videos");
            loader.dismiss();
          }

          const options: HttpOptions = {
            url: apiUrl,
            // url: this.domain + "/api/cors/",
            // data: {
            //   url: apiUrl
            // },
            headers: {
              "Referer": apiUrl,
              "Content-Type": "application/json",
            }
          }

          CapacitorHttp.get(options).then(async (response) => {
            //parse the response in json
            const json = response.data;
            console.log("JSON API: " + JSON.stringify(json));

            const mVideos = json.sources;
            var videos = [];

            for (let video of mVideos) {
              if (!video.file.includes("https://apu")) {
                video.file = video.file.replace("//", "https://");
              }
              if (video.file == "") {
                continue;
              }
              if (video.file.includes("https:https://")) {
                video.file = video.file.replace("https:https://", "https://");
              }
              videos.push({
                'label': video.label,
                'file': video.file,
                'headers': {
                  Referer: url
                },
                'kind': "video"
              });
            }

            console.log("VIDEOS: " + JSON.stringify(videos));

            if (videos.length == 0) {
              reject("No se encontraron videos");
              loader.dismiss();
              return;
            }

            loader.dismiss();
            console.log(videos);
            resolve(videos);

          }).catch(error => {
            loader.dismiss();
            console.log("ERROR 3: " + error);
            reject(error);
          });

        }).catch(error => {
          loader.dismiss();
          console.log("ERROR 2: " + error);
          reject(error);
        });

      }).catch(error => {
        loader.dismiss();
        console.log("ERROR 1: " + error);
        reject(error);
      });
    });
  }

  async animepelixResolver(url: string): Promise<any> {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      console.log("URL animepelix: " + url);
      const options: HttpOptions = {
        url: url,
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: url
        // },
        headers: {
          "Referer": "https://re.animepelix.net/",
        },
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        console.log("CONTENT animepelix: " + content);
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        const scripts = html.querySelectorAll('script');
        let mVideo = "";
        for (let script of scripts) {
          if (script.innerHTML.includes('sources: [{file:"')) {
            mVideo = script.innerHTML.split('sources: [{file:"')[1].split('"')[0];
            console.log("mVideo: " + mVideo);
            break;
          }
        }

        if (mVideo == "") {
          loader.dismiss();
          reject("No se encontraron videos");
          console.log("No se encontraron videos");
          return;
        }

        const document = [{
          label: "HD",
          file: mVideo,
          headers: {
            Referer: mVideo
          },
          kind: "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(error => {
        loader.dismiss();
        console.log("ERROR 1 animepelix: " + error);
        reject(error);
      });

    });
  }

  async streamhideResolver(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        // url: "https://animemac.net/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        const dom = new DOMParser().parseFromString(content, "text/html");
        const scripts = dom.querySelectorAll('script');
        let scriptWithVideo = "";
        for (let script of scripts) {
          if (script.innerText.includes('jwplayer("vplayer").setup')) {
            scriptWithVideo = script.innerText;
            break;
          }
        }

        const regex = /sources:\s*\[\s*({\s*file:"(https?:\/\/[^"]+)"\s*})\s*\]/g;
        const urls: string[] = [];
        let match;
        while ((match = regex.exec(scriptWithVideo)) !== null) {
          urls.push(match[2]); // file
        }

        let videos = [];
        for (let video of urls) {
          videos.push({
            label: "HD",
            file: video,
            headers: {
              Referer: video
            },
            kind: "video"
          });
        }
        const document = videos;
        loader.dismiss();
        resolve(document);
      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });
  }

  async streamhideResolverOld(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        // url: "https://animemac.net/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        const dom = new DOMParser().parseFromString(content, "text/html");
        console.log("DOM: ", dom);
        const scripts = dom.querySelectorAll('script');
        var eval_function = "";
        for (let script of scripts) {
          if (script.innerText.includes("function(p,a,c,k,e,d)")) {
            eval_function = script.innerText;
            break;
          }
        }

        CapacitorHttp.post({
          url: this.domain + "/api/v1/eval-unpack/",
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            eval: eval_function
          },
          readTimeout: 10000,
          connectTimeout: 10000
        }).then(res => {
          const data = res.data.eval;
          let json = data.split('sources: ')[1];
          json = json.split('}]')[0] + "}]";
          json = json.replace("file", '"file"');
          const parsed_json = JSON.parse(json);

          let videos = [];
          for (let video of parsed_json) {
            videos.push({
              label: "HD",
              file: video.file,
              headers: {
                Referer: video.file
              },
              kind: "video"
            });
          }

          console.log("STREAMWISH XDDDDD");

          const document = videos;
          loader.dismiss();
          resolve(document);
          
        }).catch(err => {
          reject(err);
          loader.dismiss();
        });


      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });
  }

  async sendvidResolver(url: string): Promise<any> {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        const videoUrl = html.querySelector('source').getAttribute('src');

        const document = [{
          label: "HD",
          file: videoUrl,
          headers: {
            Referer: videoUrl
          },
          kind: "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(error => {
        loader.dismiss();
        reject(error);
      });

    });
  }

  async mixdropResolver(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        // url: "https://animemac.net/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        const dom = new DOMParser().parseFromString(content, "text/html");
        const scripts = dom.querySelectorAll('script');
        var eval_function = "";
        for (let script of scripts) {
          if (script.innerText.includes("function(p,a,c,k,e,d)")) {
            eval_function = script.innerText;
            break;
          }
        }

        CapacitorHttp.post({
          url: this.domain + "/api/v1/eval-unpack/",
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            eval: eval_function
          },
          readTimeout: 10000,
          connectTimeout: 10000
        }).then(res => {
          const data = res.data.eval;
          const match = data.match(/MDCore\.wurl = "([^"]+)"/);
          const result = match ? match[1] : null;
          const video = "https:" + result;

          console.log("video: " + video)

          let videos = [];
          videos.push({
            label: "HD",
            file: video,
            kind: "video"
          });

          const document = videos;
          loader.dismiss();
          resolve(document);
          
        }).catch(err => {
          reject(err);
          loader.dismiss();
        });


      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });
  }

  async voeResolver(url: string): Promise<any> {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise<any>(async (resolve, reject) => {

      const options: HttpOptions = {
        url: url,
        // url: this.domain + "/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      CapacitorHttp.get(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        
        const scripts = html.querySelectorAll('script');
        let script = null;
        for (let s of scripts) {
          if (s.innerText.includes("sources = {")) {
            script = s.innerText;
            break;
          }
        }

        const regex = /'hls':\s*'(.+?)'/;
        const match = script.match(regex);
        const videoUrl = match ? match[1] : null;
        console.log("videoUrl: " + videoUrl)

        const document = [{
          label: "HD",
          file: videoUrl,
          headers: {
            Referer: videoUrl
          },
          kind: "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(error => {
        loader.dismiss();
        reject(error);
      });

    });
  }

  async streamhubResolver(url: string) {

    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    return new Promise((resolve, reject) => {
      const options: HttpOptions = {
        url: url,
        // url: "https://animemac.net/api/cors/",
        // data: {
        //   url: url
        // },
        readTimeout: 10000,
        connectTimeout: 10000
      };

      CapacitorHttp.get(options).then(data => {
        const content = data.data;
        const dom = new DOMParser().parseFromString(content, "text/html");
        console.log("DOM: ", dom);
        const scripts = dom.querySelectorAll('script');
        var eval_function = "";
        for (let script of scripts) {
          if (script.innerText.includes("function(p,a,c,k,e,d)")) {
            eval_function = script.innerText;
            break;
          }
        }

        CapacitorHttp.post({
          url: this.domain + "/api/v1/eval-unpack/",
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            eval: eval_function
          },
          readTimeout: 10000,
          connectTimeout: 10000
        }).then(res => {
          const data = res.data.eval;
          let json = data.split('sources: ')[1];
          json = json.split('}]')[0] + "}]";
          json = json.replace("src", '"src"');
          json = json.replace("type", '"type"');
          const parsed_json = JSON.parse(json);

          let videos = [];
          for (let video of parsed_json) {
            videos.push({
              label: "HD",
              file: video.src,
              headers: {
                Referer: video.src
              },
              kind: "video"
            });
          }

          console.log("STREAMHUB XDDDDD");

          const document = videos;
          loader.dismiss();
          resolve(document);
          
        }).catch(err => {
          reject(err);
          loader.dismiss();
        });


      }).catch(err => {
        loader.dismiss(); 
        reject(err);
      });
    });
  }

  async doodResolver(url: string): Promise<any> {
    const loader = await this.utils.createIonicLoader("Cargando videos...");
    await loader.present();

    const url_path = new URL(url).pathname;
    const final_url = ("https://dood.yt" + url_path).replace("/d/", "/e/");
    console.log("final_url: " + final_url)

    return new Promise<any>(async (resolve, reject) => {

      const options: HttpOptions = {
        // url: url,
        url: this.domain + "/api/cors/",
        data: {
          url: final_url
        },
        readTimeout: 10000,
        connectTimeout: 10000,
      }

      CapacitorHttp.post(options).then(async (response) => {
        const content = response.data;
        const parser = new DOMParser();
        const html = parser.parseFromString(content, "text/html");
        console.log("html: ", html)
        //find the script that contains pass_md5
        const scripts = html.querySelectorAll('script');
        let script = null;
        for (let s of scripts) {
          if (s.innerText.includes("/pass_md5/")) {
            script = s.innerText;
            break;
          }
        }

        console.log("script: " + script)
        
        const pattern: RegExp = /\/pass_md5\/[^\/]+\/([^']+)'/
        const result = content.match(pattern);
        if (result) {
          const match = result[0];
          console.log(match); // "/pass_md5/100053743-186-189-1684549984-5b80152f6133128d8d1aef2b7ad1c778/7j0qemzmsa5tyggeu2m5m4es"
          const captureGroup = result[1];
          console.log(captureGroup); // "7j0qemzmsa5tygge4549984-5b80152f6133128d8d1aef2b7ad1c778"
        } else {
          console.log("No se encontró ninguna coincidencia.");
        }

        const regex = /dsplayer\.hotkeys[^']+'([^']+).+?function/;
        const match = content.match(regex);
        console.log("match: " + match)
        const videoUrl = match ? match[1] : null;
        console.log("videoUrl: " + videoUrl)

        const document = [{
          label: "HD",
          file: videoUrl,
          headers: {
            Referer: videoUrl
          },
          kind: "video"
        }];
        loader.dismiss();
        resolve(document);
      }).catch(error => {
        loader.dismiss();
        reject(error);
      });

    });
  }
  
}

