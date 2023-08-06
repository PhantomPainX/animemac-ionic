import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

  public domain: string = environment.root_url;
  public amrBanUser: boolean = false;
  public amrUnbanUser: boolean = false;
  public amrReportUser: boolean = false;
  public amrGetUserReports: boolean = false;
  public amrGetBlockedUsers: boolean = false;
  public amrBlockUser: boolean = false;
  public amrUnblockUser: boolean = false;

  constructor(public utils: UtilsService) { }

  banUser(token: string, user_id: number, reason: string): Promise<any> {
    return new Promise((resolve, reject) => {

      fetch(this.domain + '/api/v1/banuser/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          user_id: user_id,
          reason: reason
        })
      }).then(async (res) => {
        const data = await res.json();
        if (res.status === 200) {
          resolve(data);
        } else {
          reject(data);
        }
      }).catch(() => {
        if (!this.amrBanUser) {
          this.amrBanUser = true;
          const interval = setInterval(() => {
            this.banUser(token, user_id, reason).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrBanUser = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
      
    });
  }

  unbanUser(token: string, user_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      
      fetch(this.domain + '/api/v1/unbanuser/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          'user_id': user_id
        })
      }).then(async (res) => {
        const data = await res.json();
        if (res.status === 200) {
          resolve(data);
        } else {
          reject(data);
        }
      }).catch(() => {
        if (!this.amrUnbanUser) {
          this.amrUnbanUser = true;
          const interval = setInterval(() => {
            this.unbanUser(token, user_id).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrUnbanUser = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  reportUser(token: string, reportedUserId: number, reason: string): Promise<any> {

    return new Promise((resolve, reject) => {

      fetch(this.domain + '/api/v1/user-reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          reported_user: reportedUserId,
          reason: reason
        }
      )}).then(async (res) => {

        if (res.status == 201) {
          resolve(true);
        } else if (res.status == 403) {
          let data = await res.json();
          data.error = "Fuiste baneado";
          reject(data);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        
        } else {
          const data = await res.json();
          reject(data);
        }

      }).catch(() => {
        if (!this.amrReportUser) {
          this.amrReportUser = true;
          const interval = setInterval(() => {
            this.reportUser(token, reportedUserId, reason).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrReportUser = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });

  }

  getUserReports(token: string, reportedUserId: number, page: number): Promise<any> {

    return new Promise((resolve, reject) => {

      fetch(this.domain + '/api/v1/user-reports/?reported_user=' + reportedUserId + '&page=' + page, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      }).then(async (res) => {

        if (res.status == 200) {
          const data = await res.json();
          resolve(data);
        } else {
          const data = await res.json();
          reject(data);
        }

      }).catch(() => {
        if (!this.amrGetUserReports) {
          this.amrGetUserReports = true;
          const interval = setInterval(() => {
            this.getUserReports(token, reportedUserId, page).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetUserReports = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });

    });

  }

  getBlockedUsers(token: string, page: number, sortName: string): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      var url: string = this.domain + "/api/v1/user-blocks/?page=" + page + "&ordering=" + sortName;

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      }).then(async (res) => {
          
        if (res.status == 200) {
          const data = await res.json();
          resolve(data);
        } else {
          const data = await res.json();
          reject(data);
        }
  
      }).catch(() => {
        if (!this.amrGetBlockedUsers) {
          this.amrGetBlockedUsers = true;
          const interval = setInterval(() => {
            this.getBlockedUsers(token, page, sortName).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetBlockedUsers = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });

  }

  blockUser(token: string, blockedUserId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      const url = this.domain + '/api/v1/user-blocks/';

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          blocked_user: blockedUserId
        })
      }).then(async (res) => {
        if (res.status == 201) {
          resolve(true);
        } else {
          const data = await res.json();
          reject(data);
        }

      }).catch(() => {
        if (!this.amrBlockUser) {
          this.amrBlockUser = true;
          const interval = setInterval(() => {
            this.blockUser(token, blockedUserId).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrBlockUser = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });

    });
  }

  unblockUser(token: string, blockedUserId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      const url = this.domain + '/api/v1/user-blocks/' + blockedUserId + '/';

      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      }).then(async (res) => {
        if (res.status == 204) {
          resolve(true);
        } else {
          const data = await res.json();
          reject(data);
        }

      }).catch(() => {
        if (!this.amrUnblockUser) {
          this.amrUnblockUser = true;
          const interval = setInterval(() => {
            this.unblockUser(token, blockedUserId).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrUnblockUser = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });

    });
  }
}
