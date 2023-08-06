import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class MoeService {

  constructor() { }

  getAnimeMeta(anime: string): Promise<any> {

    return new Promise<any>((resolve, reject) => {

      const options = {
        method: 'GET'
      };

      fetch('https://api.jikan.moe/v4/anime?q=' + anime + '&limit=20', options)
        .then(res => res.json())
        .then(async res => {

          const results = res.data;
          var correctAnime = false;

          for (let result of results) {
            var result_title = result.title.toLowerCase();
            const db_title = anime.toLowerCase();

            if (result_title == db_title) {
              correctAnime = true;
            } else {
              const other_titles = result.titles;
              for (let other_title of other_titles) {
                var other_title_lower = other_title.title.toLowerCase();
                if (other_title_lower == db_title) {
                  correctAnime = true;
                  break;
                }
              }
            }

            if (correctAnime) {
              resolve(result);
              break;
            }
          }
          if (!correctAnime) {
            resolve(false);
          }
        }).catch(error => reject(error));
    });
  }

  getAnimePictures(malId: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const options = {
        method: 'GET'
      };

      fetch('https://api.jikan.moe/v4/anime/' + malId + '/pictures', options)
        .then(res => res.json())
        .then(res => {
          const pictures = res.data;
          resolve(pictures);
        }).catch(error => reject(error));
    });
  }

  getAnimeFull(malId: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const options = {
        method: 'GET'
      };
      fetch('https://api.jikan.moe/v4/anime/' + malId + '/full', options)
        .then(res => res.json())
        .then(res => {
          const full = res.data;
          resolve(full);
        }).catch(error => reject(error));
    });

  }

  getAnimeOpEd(malId: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      const options = {
        method: 'GET'
      };

      fetch('https://api.jikan.moe/v4/anime/'+ malId +'/videos', options)
        .then(res => res.json())
        .then(async res => {
          const results = res.data.music_videos;
          resolve(results);
        }).catch(error => reject(error));

    });
  }

}
