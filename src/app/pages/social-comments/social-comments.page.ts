import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetButton, ActionSheetController, AlertController, IonInfiniteScroll, MenuController, ModalController, Platform, ToastController } from '@ionic/angular';
import { AnimeComment } from 'src/app/classes/anime-comment/anime-comment';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { CommentPage } from 'src/app/modals/comment/comment.page';
import { RepliesPage } from 'src/app/modals/comment/replies/replies.page';
import { CommentsService } from 'src/app/services/comments/comments.service';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-social-comments',
  templateUrl: './social-comments.page.html',
  styleUrls: ['./social-comments.page.scss'],
})
export class SocialCommentsPage implements OnInit {

  @ViewChild('InfiniteScrollComments') InfiniteScroll: IonInfiniteScroll;
  public user: PrivateUser;
  public isLogged: boolean = false;
  public paginationInfo: any;
  public commentsPagination: any;
  public comments: any[] = [];
  public commentsType: string = 'anime';
  public commentsTypeRealChanged: string = 'anime';
  public fetching: boolean = true;
  public noCommentsAvailable: boolean = false;
  public domain: string = environment.root_url;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = '-created_at';

  public token: string = null;


  constructor(public commentsService: CommentsService, public alertCtrl: AlertController, 
    public utils: UtilsService, public actionCtrl: ActionSheetController, 
    public modalCtrl: ModalController, public localStorage: PreferencesService, public platform: Platform, 
    public menu: MenuController, public moderation: ModerationService, public toastCtrl: ToastController) { }

  ngOnInit() {

    this.platform.ready().then(async () => {
      setTimeout(() => {
        this.InfiniteScroll.disabled = true;
      }, 1);
  
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
        this.token = this.user.token;
      }
      
      this.getComments();
    });

  }

  async getComments() {

    this.fetching = true;
    this.noCommentsAvailable = false;
    
    await this.commentsService.getCommentsByType(this.token, this.commentsType, 1, this.sortName).then((data) => {
      this.commentsTypeRealChanged = this.commentsType;
      this.fetching = false;
      this.paginationInfo = data;

      this.comments = data.results;

      if (this.comments.length == 0) {
        this.noCommentsAvailable = true;
        this.InfiniteScroll.disabled = true;
      } else {
        this.commentsPagination = {
          'actualPage': 1,
          'hasNextPage': this.paginationInfo.next != null,
        }
  
        if (this.commentsPagination.hasNextPage) {
          this.InfiniteScroll.disabled = false;
        }
      }

    });
  }

  async segmentChanged(event) {
    await this.getComments();
    this.commentsType = event.detail.value;
  }

  async toggleRefresh(event) {
    await this.getComments();
    event.target.complete();
  }

  async deleteComment(comment: any) {
    const loader = await this.utils.createIonicLoader('Eliminando...');
    loader.present();
    await this.commentsService.deleteComment(comment.id, this.user.token, this.commentsType).then((deleted) => {
      loader.dismiss();
      if (deleted) {
        this.getComments();
        this.utils.showToast('Comentario eliminado', 1, false);
      } else {
        this.utils.showToast('Error al eliminar el comentario', 1, true);
      }
    }).catch(() => {
      loader.dismiss();
    });
  }

  async reportComment(comment: any) {
    const loader = await this.utils.createIonicLoader('Espera...');
    loader.present();
    this.commentsService.getReportKinds(this.user.token).then(async (kinds) => {
      loader.dismiss();

      //create inputs for action sheet
      const inputs = [];
      kinds.forEach((kind) => {
        inputs.push({
          label: kind.kind,
          type: 'radio',
          value: kind.id
        });
      });

      const alert = await this.alertCtrl.create({
        header: 'Denunciar comentario',
        cssClass: 'alert-report-comment',
        mode: 'ios',
        translucent: true,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Denunciar',
            role: 'ok',
            handler: async (kindId) => {
              const loader = await this.utils.createIonicLoader('Enviando...');
              loader.present();
              this.commentsService.reportComment(comment.id, kindId, this.user.token, this.commentsType).then((response) => {
                loader.dismiss();
                if (response.success) {
                  this.utils.showToast(response.message, 1, false);
                  this.comments = this.comments.filter((c) => c.id != comment.id);
                } else {
                  this.utils.showToast(response.message, 1, true);
                }
              });
            }
          }
        ],
        inputs: inputs
      });
  
      await alert.present();
    }).catch(() => {
      loader.dismiss();
    });
  }

  async openModeration(comment: any) {
    if (this.user.is_staff || this.user.groups.moderator) {
      let buttons: ActionSheetButton[] = [
        {
          text: 'Cerrar',
          icon: 'close',
          role: 'cancel'
        }
      ];
      if (comment.user.is_active) {
        buttons.unshift({
          text: 'Banear usuario',
          icon: 'ban',
          handler: () => {
            this.banUser(comment.user);
          }
        });
      } else {
        buttons.unshift({
          text: 'Desbanear usuario',
          icon: 'ban',
          handler: () => {
            this.unbanUser(comment.user);
          }
        });
      }

      if (this.user.is_staff) {
        buttons.push({
          text: 'Eliminar comentario',
          icon: 'trash',
          handler: async () => {
            this.alertCtrl.create({
              header: 'Eliminar comentario',
              message: '¿Estás seguro de que quieres eliminar este comentario?',
              mode: 'ios',
              translucent: true,
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Eliminar',
                  handler: () => {
                    this.deleteComment(comment);
                  }
                }
              ]
            }).then((alert) => {
              alert.present();
            });
          }
        });
      }

      const actionSheet = await this.actionCtrl.create({
        header: 'Opciones de Moderación',
        buttons: buttons
      });
      await actionSheet.present();
    } else {
      this.utils.showToast('No tienes permisos para moderar', 1, true);
    }
  }

  async openCommentOptions(comment: any) {

    var buttons = [];
    if (this.user.email === comment.user.email) {
      buttons = [
        {
          text: 'Eliminar comentario',
          icon: 'trash',
          handler: async () => {
            this.alertCtrl.create({
              header: 'Eliminar comentario',
              message: '¿Estás seguro de que quieres eliminar tu comentario?',
              mode: 'ios',
              translucent: true,
              buttons: [
                {
                  text: 'Cancelar',
                  role: 'cancel'
                },
                {
                  text: 'Eliminar',
                  handler: () => {
                    this.deleteComment(comment);
                  }
                }
              ]
            }).then((alert) => {
              alert.present();
            });
          }
        }, {
          text: 'Cerrar',
          icon: 'close',
          role: 'cancel'
        }
      ];

    } else {
      buttons = [
        {
          text: 'Bloquear a ' + comment.user.username,
          icon: 'person-remove',
          handler: () => {
            this.blockUser(comment.user);
          }
        },
        {
          text: 'Denunciar comentario',
          icon: 'flag',
          handler: () => {
            this.reportComment(comment);
          }
        }, 
        {
          text: 'Reportar a ' + comment.user.username,
          icon: 'flag',
          handler: () => {
            this.reportUser(comment.user);
          }
        },
        {
          text: 'Cerrar',
          icon: 'close',
          role: 'cancel'
        }
      ];
    }

    const actionSheet = await this.actionCtrl.create({
      header: 'Opciones',
      buttons: buttons
    });
    await actionSheet.present();
  }

  uncensorComment(comment: any) {
    comment.reports = 0;
  }

  showDeletedComment(comment: any) {
    if (this.user.is_staff) {
      comment.reports = 0;
    }
  }

  openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    this.getComments();
  }

  openComments(comment: any) {
    if (this.commentsType == 'anime') {
      this.modalCtrl.create({
        component: CommentPage,
        cssClass: 'rounded-modal',
        canDismiss: true,
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        componentProps: {
          anime: comment.anime_detail,
          commentsType: 'anime',
          comment: comment
        }
      }).then(async modal => {
        await modal.present();

        const { data } = await modal.onDidDismiss();
        if (data) {
          if (data.blockedAnUser) {
            this.getComments();
          }
        }
      });
    } else if (this.commentsType == 'episode') {
      this.modalCtrl.create({
        component: CommentPage,
        cssClass: 'rounded-modal',
        canDismiss: true,
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        componentProps: {
          episode: comment.episode_detail,
          commentsType: 'episode',
          comment: comment
        }
      }).then(async modal => {
        await modal.present();

        const { data } = await modal.onDidDismiss();
        if (data) {
          if (data.blockedAnUser) {
            this.getComments();
          }
        }

      });
    }
  }

  async loadMoreComments(event) {
    if (this.commentsPagination.hasNextPage) {

      await this.commentsService.getCommentsByType(this.token, this.commentsType, this.commentsPagination.actualPage + 1, this.sortName).then(data => {

        this.comments = this.comments.concat(data.results);
        this.commentsPagination = {
          'actualPage': this.commentsPagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }, error => {
        console.log(error);
        // const interval = setInterval(() => {
        //   this.obtainLatestsEpisodes(this.episodesPagination.actualPage + 1).then(() => {
        //     clearInterval(interval);
        //   });
        // }, 3000);
      });
      
    } else {
      event.target.complete();
      this.InfiniteScroll.disabled = true;
    }
  }

  openMenu() {
    this.menu.open();
  }

  async openReplies(comment: any) {
    const modal = await this.modalCtrl.create({
      component: RepliesPage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        'comment': comment
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      if (data.blockedAnUser) {
        this.getComments();
      }
    }
  }

  async reportUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Reportar usuario',
      message: 'Estas reportando a ' + user.username + '',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reportar',
          handler: async (inputs) => {

            if (!inputs.reason) {
              if (await this.toastCtrl.getTop() == null) {
                this.utils.showToast('Debes proporcionar el motivo de tu reporte', 1, true);
                return false;
              }
              return false;
            }

            const loader = await this.utils.createIonicLoader('Reportando usuario...');
            await loader.present();
            await this.moderation.reportUser(this.user.token, user.id, inputs.reason).then(async () => {
              loader.dismiss();
              this.alertCtrl.create({
                header: 'Reporte enviado',
                message: 'Tu reporte ha sido enviado a nuestros moderadores. Gracias por tu colaboración',
                mode: 'ios',
                translucent: true,
                buttons: [
                  {
                    text: 'Aceptar',
                    role: 'cancel'
                  }
                ]
              }).then((alert) => {
                alert.present();
              });
            }).catch(async (error) => {
              loader.dismiss();
              this.utils.showToast(error.error, 1, true);
            });
          }
        }
      ],
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Motivo de tu reporte'
        }
      ]
    });
    await alert.present();
  }

  async banUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Ingresa la razón de la prohibición',
      message: user.username+" ya no podrá acceder a la aplicación",
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Banear',
          handler: async (inputs) => {
            if (!inputs.reason) {
              if (await this.toastCtrl.getTop() == null) {
                this.utils.showToast('Debes ingresar la razón de la prohibición', 1, true);
              }
              return false;
            }
      
            const loader = await this.utils.createIonicLoader('Baneando usuario...');
            await loader.present();
            await this.moderation.banUser(this.user.token, user.id, inputs.reason).then(async (res) => {
              loader.dismiss();
              console.log(res);
              this.utils.showToast('Usuario baneado correctamente', 1, true);
              user.is_active = res.banned_user.is_active;
              user.user_extra = res.banned_user.user_extra;
            }).catch(async (err) => {
              loader.dismiss();
              console.log(err);
              this.utils.showToast(err.error, 1, true);
            });
          }
        }
      ],
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Razón',
        }
      ]
    });
    await alert.present();
  }

  async unbanUser(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Desbanear usuario',
      message: '¿Estás seguro de que quieres desbanear al usuario '+user.username+'?',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Desbanear',
          handler: async () => {
            const loader = await this.utils.createIonicLoader('Desbaneando usuario...');
            await loader.present();
            await this.moderation.unbanUser(this.user.token, user.id).then(async (res) => {
              loader.dismiss();
              this.utils.showToast('Usuario desbaneado correctamente', 1, true);
              user.is_active = res.unbanned_user.is_active;
              user.user_extra = res.unbanned_user.user_extra;
            }).catch(async (err) => {
              loader.dismiss();
              this.utils.showToast(err.error, 1, true);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async blockUser(user: any) {

    const alert = await this.alertCtrl.create({
      header: 'Bloquear usuario',
      subHeader: '¿Estás seguro de que quieres bloquear al usuario '+user.username+'?',
      message: 'No podras ver sus comentarios ni respuestas',
      cssClass: 'alert-report-comment',
      mode: 'ios',
      translucent: true,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Bloquear',
          handler: async () => {
            const loader = await this.utils.createIonicLoader('Bloqueando usuario...');
            await loader.present();
            await this.moderation.blockUser(this.user.token, user.id).then(async (res) => {
              loader.dismiss();
              if (res) {
                
                const alert = await this.alertCtrl.create({
                  header: 'Usuario bloqueado',
                  subHeader: 'El usuario '+user.username+' ha sido bloqueado correctamente',
                  message: 'Puedes desbloquearlo en cualquier momento desde tu perfil',
                  cssClass: 'alert-report-comment',
                  mode: 'ios',
                  translucent: true,
                  buttons: [
                    {
                      text: 'Aceptar',
                      role: 'cancel'
                    }
                  ]
                });
                await alert.present();

                this.getComments();
              } else {
                this.utils.showToast('No se pudo bloquear al usuario', 1, true);
              }
            }).catch(async (err) => {
              loader.dismiss();
              this.utils.showToast(err.error, 1, true);
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
