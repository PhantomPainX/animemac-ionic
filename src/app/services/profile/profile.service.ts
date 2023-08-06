import { EventEmitter, Injectable } from '@angular/core';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { environment } from 'src/environments/environment.prod';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  public domain: string = environment.root_url;
  public amrGetUserPrivateDetail: boolean = false;
  public amrUpdateProfile: boolean = false;
  public amrDeleteUserData: boolean = false;
  public amrUpdateUserExtra: boolean = false;

  public updatedUserExtra$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public utils: UtilsService) { }

  getUserPrivateDetail(userId: number, token: string): Promise<PrivateUser> {
    return new Promise<PrivateUser>((resolve, reject) => {
      const url = this.domain + '/api/v1/users-private-detail/' + userId + '/';

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      }).then(response => response)
      .then(async data => {
        const json = await data.json();
        if (data.status === 200) {
          resolve(json);
        } else {
          reject(json);
        }
      }).catch(() => {
        if (!this.amrGetUserPrivateDetail) {
          this.amrGetUserPrivateDetail = true;
          const interval = setInterval(() => {
            this.getUserPrivateDetail(userId, token).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetUserPrivateDetail = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  updateProfile(userId: number, token: string, username: string, first_name: string, last_name: string, email: string): Promise<any> {
    return new Promise<any>((resolve) => {
      const url = this.domain + '/api/v1/users-private-detail/' + userId + '/';

      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          username: username,
          first_name: first_name,
          last_name: last_name,
          email: email
        })
      }).then(response => response)
      .then(async data => {
        const json = await data.json();
        if (data.status === 200) {
          resolve({
            status: true,
            message: 'Perfil de usuario actualizado',
            user: json
          });
        } else if (data.status == 403) {
          resolve({
            status: false,
            message: "Usuario baneado"
          });
          if (json.detail) {
            if (json.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          resolve({
            status: false,
            message: json.error
          })
        }
      }).catch(() => {
        if (!this.amrUpdateProfile) {
          this.amrUpdateProfile = true;
          const interval = setInterval(() => {
            this.updateProfile(userId, token, username, first_name, last_name, email).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrUpdateProfile = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  deleteUserData(userId: number, token: string) : Promise<any> {
    return new Promise<any>((resolve) => {
      const url = this.domain + '/api/v1/users-private-detail/' + userId + '/';

      fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Token ' + token
        }
      }).then(response => response)
      .then(async data => {
        if (data.status === 204) {
          resolve(true);

        } else if (data.status == 403) {
          resolve(false);
          const json = await data.json();
          if (json.detail) {
            if (json.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          resolve(false);
        }
      }).catch(() => {
        if (!this.amrDeleteUserData) {
          this.amrDeleteUserData = true;
          const interval = setInterval(() => {
            this.deleteUserData(userId, token).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrDeleteUserData = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  updateUserExtra(userId: number, userExtraId: number, token: string, image: string, compliant: boolean): Promise<any> {
    return new Promise<any>((resolve) => {

      const url = this.domain + '/api/v1/users-extra/' + userExtraId + '/';
      const formData = new FormData();
      //append the image and the user id
      formData.append('avatar', image);
      formData.append('user', userId.toString());
      formData.append('thirteen_age_coppa_compliant', compliant.toString());

      fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': 'Token ' + token
        },
        body: formData
      }).then(response => response)
      .then(async data => {

        const json = await data.json();
        console.log("User updated: ", json);
        if (data.status === 200) {
          resolve({
            status: true,
            message: 'Imagen de perfil actualizada',
            userExtra: json
          });
        
        } else if (data.status == 403) {
          resolve({
            status: false,
            message: "Usuario baneado"
          });
          if (json.detail) {
            if (json.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }

        } else {
          resolve({
            status: false,
            message: json.error
          })
        }
      }).catch(() => {
        if (!this.amrUpdateUserExtra) {
          this.amrUpdateUserExtra = true;
          const interval = setInterval(() => {
            this.updateUserExtra(userId, userExtraId, token, image, compliant).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrUpdateUserExtra = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }
}
