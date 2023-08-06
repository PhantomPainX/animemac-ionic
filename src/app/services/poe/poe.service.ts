import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PoeService {

  public domain: string = environment.root_url;
  public poe_token: string = "gZsAm7w5txfqX0MK8WTCAA%3D%3D"
  constructor() { }

  async getResumeWithoutSpoilers(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=resume_no_spoilers" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getResumeWithSpoilers(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=resume" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getInterestingFacts(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=interesting_facts" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getCharacters(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=characters" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getStaff(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=staff" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getRelevantEpisodes(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=relevant_episodes" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  async getRecommendations(anime_name: string) {
    return new Promise<any>((resolve, reject) => {
      const url: string = this.domain + "/api/v1/poe/?anime_name=" + anime_name + "&consult_type=recommendations" + "&poe_token="+this.poe_token;
      fetch(url, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
    });
  }
}
