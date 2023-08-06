import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root'
})
export class RepliesService {

  public domain: string = environment.root_url;
  public amrGetReplies: boolean = false;
  public amrSendReply: boolean = false;
  public amrDeleteReply: boolean = false;
  public amrGetReportKinds: boolean = false;
  public amrReportReply: boolean = false;
  constructor(public utils: UtilsService) { }

  getReplies(token: string, comment: number, page: number, type: string, ordering: string): Promise<any> {

    return new Promise<any>((resolve) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments-replies/?comment=" + comment + "&ordering=" + ordering + "&page=" + page;
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments-replies/?comment=" + comment + "&ordering=" + ordering + "&page=" + page;
      }

      let headers = {};
      if (token != null) {
        headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      } else {
        headers = {
          'Content-Type': 'application/json'
        }
      }

      fetch(url, {
        method: 'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);

      }).catch(() => {
        if (!this.amrGetReplies) {
          this.amrGetReplies = true;
          const interval = setInterval(() => {
            this.getReplies(token, comment, page, type, ordering).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetReplies= false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  sendReply(commentId: number, reply: string, token: string, type: string): Promise<any> {
      
    return new Promise<any>((resolve) => {

      let body = {};
      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments-replies/";
        body = {
          comment: commentId,
          reply: reply
        };
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments-replies/";
        body = {
          comment: commentId,
          reply: reply
        };
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(body)
      })
      .then(async response => {
        const data = await response.json();

        if (response.status === 201) {
          resolve({
            success: true,
            message: "Respuesta creada"
          });
        } else if (response.status === 403) {
          resolve({
            success: false,
            message: "Fuiste baneado"
          });
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        
        } else {

          resolve({
            success: false,
            message: data.error
          });
        }
      }).catch(() => {
        if (!this.amrSendReply) {
          this.amrSendReply = true;
          const interval = setInterval(() => {
            this.sendReply(commentId, reply, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrSendReply = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  deleteReply(replyId: number, token: string, type: string): Promise<Boolean> {
        
    return new Promise<Boolean>((resolve, reject) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments-replies/" + replyId + "/";
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments-replies/" + replyId + "/";
      }

      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      })
      .then(async response => {
        if (response.status === 204) {
          resolve(true);
        } else if (response.status === 403) {
          const data = await response.json();
          reject(false);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              this.utils.showBanAlert();
            }
          }
        
        } else {
          resolve(false);
        }

      }).catch(() => {
        if (!this.amrDeleteReply) {
          this.amrDeleteReply = true;
          const interval = setInterval(() => {
            this.deleteReply(replyId, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrDeleteReply = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  getReportKinds(token: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var url = this.domain + "/api/v1/report-kinds/";

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        }
      })
      .then(async response => {
        const data = await response.json();
        if (response.status === 200) {
          resolve(data.results);
        } else if (response.status === 403) {
          reject(false);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        }
      }).catch(() => {
        if (!this.amrGetReportKinds) {
          this.amrGetReportKinds = true;
          const interval = setInterval(() => {
            this.getReportKinds(token).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetReportKinds = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  reportReply(replyId: number, kind: number, token: string, type: string): Promise<any> {
        
    return new Promise<any>((resolve) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comment-replies-reports/";
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comment-replies-reports/";
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          reply: replyId,
          kind: kind
        })
      })
      .then(async response => {
        const data = await response.json();

        if (response.status === 201) {
          resolve({
            success: true,
            message: "Respuesta denunciada"
          });
        } else if (response.status === 403) {
          resolve({
            success: false,
            message: "Fuiste baneado"
          });
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        } else {
          resolve({
            success: false,
            message: data.error
          });
        }
      }).catch(() => {
        if (!this.amrReportReply) {
          this.amrReportReply = true;
          const interval = setInterval(() => {
            this.reportReply(replyId, kind, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrReportReply = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }
}
