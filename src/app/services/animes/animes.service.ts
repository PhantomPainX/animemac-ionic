import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AnimesService {

  public domain: string = environment.root_url;
  public amrToggleAnimeDisabledComments: boolean = false;

  constructor() { }

  toggleAnimeDisabledComments(animeId: number, token: string, disabled: boolean) {
    return new Promise((resolve, reject) => {
      fetch(this.domain + '/api/v1/animes/' + animeId + '/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          comments_disabled: disabled
        }),
      }).then(async response => {
        const data = await response.json();
        if (response.status == 200) {
          resolve(true);
        } else {
          reject(false);
        }

      }).catch(() => {
        if (!this.amrToggleAnimeDisabledComments) {
          this.amrToggleAnimeDisabledComments = true;
          const interval = setInterval(() => {
            this.toggleAnimeDisabledComments(animeId, token, disabled).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrToggleAnimeDisabledComments = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }
}
