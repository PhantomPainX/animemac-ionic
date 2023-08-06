import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { UtilsService } from '../utils.service';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  public domain: string = environment.root_url;
  public amrGetComments: boolean = false;
  public amrGetComment: boolean = false;
  public amrCreateComment: boolean = false;
  public amrToggleCommentNotification: boolean = false;
  public amrDeleteComment: boolean = false;
  public amrGetReportKinds: boolean = false;
  public amrReportComment: boolean = false;
  public amrGetCommentsByType: boolean = false;

  constructor(public utils: UtilsService) { }

  getComments(token: string, anime: number, page: number, type: string, ordering: string): Promise<any> {

    return new Promise<any>((resolve) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments/?anime=" + anime + "&ordering="+ ordering + "&page=" + page;
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments/?episode=" + anime + "&ordering=" + ordering + "&page=" + page;
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
        if (!this.amrGetComments) {
          this.amrGetComments = true;
          const interval = setInterval(() => {
            this.getComments(token, anime, page, type, ordering).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetComments = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  getComment(commentId: number, type: string): Promise<any> {
      
      return new Promise<any>((resolve) => {
  
        if (type === 'anime') {
          var url = this.domain + "/api/v1/anime-comments/" + commentId + "/";
        } else if (type === 'episode') {
          var url = this.domain + "/api/v1/episode-comments/" + commentId + "/";
        }
  
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          resolve(data);

        }).catch(() => {
          if (!this.amrGetComment) {
            this.amrGetComment = true;
            const interval = setInterval(() => {
              this.getComment(commentId, type).then(data => {
                resolve(data);
                clearInterval(interval);
                this.amrGetComment = false;
              }).catch(() => {
                clearInterval(interval);
              });
            }, 3000);
          }
        });
      });
  }

  createComment(id: number, comment: string, token: string, type: string): Promise<any> {
      
    return new Promise<any>((resolve) => {

      let body = {};
      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments/";
        body = {
          anime: id,
          comment: comment
        };
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments/";
        body = {
          episode: id,
          comment: comment
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
            message: "Comentario creado"
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
        if (!this.amrCreateComment) {
          this.amrCreateComment = true;
          const interval = setInterval(() => {
            this.createComment(id, comment, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrCreateComment = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  toggleCommentNotification(token: string, commentId: number, animeOrEpisodeId: number, comment: string, type: string, notifications: boolean): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {

      let body = {};
      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments/" + commentId + "/";
        body = {
          anime: animeOrEpisodeId,
          comment: comment,
          notifications: notifications
        };
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments/" + commentId + "/";
        body = {
          episode: animeOrEpisodeId,
          comment: comment,
          notifications: notifications
        };
      }

      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify(body)
      })
      .then(async response => {
        const data = await response.json();
        if (response.status === 200) {
          resolve(data);
        } else if (response.status === 403) {
          reject(false);
          if (data.detail) {
            if (data.detail == "User inactive or deleted.") {
              await this.utils.showBanAlert();
            }
          }
        
        } else {
          reject(false);
        }
        
      }).catch(() => {
        if (!this.amrToggleCommentNotification) {
          this.amrToggleCommentNotification = true;
          const interval = setInterval(() => {
            this.toggleCommentNotification(token, commentId, animeOrEpisodeId, comment, type, notifications).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrToggleCommentNotification = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  deleteComment(comment: number, token: string, type: string): Promise<Boolean> {
        
    return new Promise<Boolean>((resolve, reject) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comments/" + comment + "/";
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comments/" + comment + "/";
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
              await this.utils.showBanAlert();
            }
          }
        } else {
          resolve(false);
        }

      }).catch(() => {
        if (!this.amrDeleteComment) {
          this.amrDeleteComment = true;
          const interval = setInterval(() => {
            this.deleteComment(comment, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrDeleteComment = false;
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

  reportComment(comment: number, kind: number, token: string, type: string): Promise<any> {
        
    return new Promise<any>((resolve) => {

      if (type === 'anime') {
        var url = this.domain + "/api/v1/anime-comment-reports/";
      } else if (type === 'episode') {
        var url = this.domain + "/api/v1/episode-comment-reports/";
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + token
        },
        body: JSON.stringify({
          comment: comment,
          kind: kind
        })
      })
      .then(async response => {
        const data = await response.json();

        if (response.status === 201) {
          resolve({
            success: true,
            message: "Comentario denunciado"
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
        if (!this.amrReportComment) {
          this.amrReportComment = true;
          const interval = setInterval(() => {
            this.reportComment(comment, kind, token, type).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrReportComment = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }

  getCommentsByType(token: string, type: string, page: number, sort: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var url = "";

      if (type === 'anime') {
        url = this.domain + "/api/v1/anime-comments/?ordering=" + sort + "&page=" + page;
      } else if (type === 'episode') {
        url = this.domain + "/api/v1/episode-comments/?ordering=" + sort + "&page=" + page;
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
        if (!this.amrGetCommentsByType) {
          this.amrGetCommentsByType = true;
          const interval = setInterval(() => {
            this.getCommentsByType(token, type, page, sort).then(data => {
              resolve(data);
              clearInterval(interval);
              this.amrGetCommentsByType = false;
            }).catch(() => {
              clearInterval(interval);
            });
          }, 3000);
        }
      });
    });
  }
}
