import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetButton, ActionSheetController, AlertController, IonInfiniteScroll, ModalController, Platform, ToastController } from '@ionic/angular';
import { AnimeComment } from 'src/app/classes/anime-comment/anime-comment';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { CommentsService } from 'src/app/services/comments/comments.service';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';
import { RepliesPage } from './replies/replies.page';

declare var require: any;
@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {

  @ViewChild('InfiniteScrollComments') InfiniteScroll: IonInfiniteScroll;

  public formComment: FormGroup;
  public user: PrivateUser;
  public isLogged: boolean = false;
  public profileImage: string = "assets/icon/avatar.svg";

  @Input() commentsType: string;
  @Input() anime: any;
  @Input() episode: any;

  public modalTitle: string = 'Comentarios';
  public firstSearch: boolean = true;
  public updating: boolean = false;
  public disabled: boolean = false;
  public animeOrEpisodeId: number;
  public commentsDisabled: boolean = false;

  public paginationInfo: any;
  public commentsPagination: any;
  public comments: any = [];

  public token: string = null;
  public blockedAnUser: boolean = false;
  public domain: string = environment.root_url;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = '-created_at';

  public fetchingComments: boolean = false;

  constructor(public commentsService: CommentsService, public formBuilder: FormBuilder, 
    public utils: UtilsService, public actionCtrl: ActionSheetController, 
    public alertCtrl: AlertController, public modalCtrl: ModalController, 
    public localStorage: PreferencesService, public platform: Platform, 
    public toastCtrl: ToastController, public moderation: ModerationService) {
    this.formComment = this.formBuilder.group({
      comment: ['', [
        Validators.required
      ]]
    })
  }

  ngOnInit() {

    setTimeout(() => {
      this.InfiniteScroll.disabled = true;
    }, 1);

    this.platform.ready().then(async () => {
      this.isLogged = await this.localStorage.getLogged();
      if (this.isLogged) {
        this.user = await this.localStorage.getUser();
        this.token = this.user.token;

        if (!this.user.user_extra.avatar.includes(this.domain)) {
          this.profileImage = this.domain + this.user.user_extra.avatar;
        } else {
          this.profileImage = this.user.user_extra.avatar;
        }
      }

      if (this.commentsType === 'anime') {
        this.animeOrEpisodeId = this.anime.id;
        this.commentsDisabled = this.anime.comments_disabled;
      } else if (this.commentsType === 'episode') {
        this.animeOrEpisodeId = this.episode.id;
        this.commentsDisabled = this.episode.comments_disabled;
      }
      
      this.getComments(true);
    });
  }

  async getComments(firstSearch: boolean) {
    if (firstSearch) {
      this.firstSearch = true
    }

    this.fetchingComments = true;
    
    await this.commentsService.getComments(this.token, this.animeOrEpisodeId, 1, this.commentsType, this.sortName).then((data) => {
      this.firstSearch = false;
      this.fetchingComments = false;
      this.paginationInfo = data;

      this.comments = data.results;

      this.commentsPagination = {
        'actualPage': 1,
        'hasNextPage': this.paginationInfo.next != null,
      }

      if (this.comments.length === 1) {
        this.modalTitle = this.paginationInfo.count + ' Comentario';
      } else if (this.comments.length > 1) {
        this.modalTitle = this.paginationInfo.count + ' Comentarios';
      } else {
        this.modalTitle = 'Comentarios';
      }

      if (this.commentsPagination.hasNextPage) {
        this.InfiniteScroll.disabled = false;
      }

    }).catch(() => {
      this.utils.showToast('Error al obtener los comentarios', 1, true);
      this.firstSearch = false;
      this.fetchingComments = false;
    });
  }

  async sendComment() {

    //check if comment has any url with regex
    const regex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
    const comment = this.formComment.value.comment;
    const hasUrl = comment.match(regex);

    if (hasUrl) {
      this.utils.showToast('No se permiten URLs en los comentarios', 1, true);
    } else {

      const loader = await this.utils.createIonicLoader('Enviando comentario...');
      loader.present();

      await this.commentsService.createComment(this.animeOrEpisodeId, this.formComment.value.comment, this.user.token, this.commentsType).then((response) => {
        if (response.success) {
          this.formComment.reset();
          this.getComments(false);
        } else {
          this.utils.showToast(response.message, 1, true);
        }
      });

      loader.dismiss();
    }
  }

  async deleteComment(comment: any) {
    const loader = await this.utils.createIonicLoader('Eliminando...');
    loader.present();
    await this.commentsService.deleteComment(comment.id, this.user.token, this.commentsType).then((deleted) => {
      loader.dismiss();
      if (deleted) {
        this.getComments(false);
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
              if (!kindId) {
                if (await this.toastCtrl.getTop() == null) {
                  this.utils.showToast('Debes seleccionar un motivo para la denuncia', 1, true);
                }
                return false;
              }
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


  get errorControl() {
    return this.formComment.controls;
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'blockedAnUser': this.blockedAnUser
    });
  }

  async toggleRefresh(event) {
    this.updating = true;
    await this.getComments(false);
    this.updating = false;
    event.target.complete();
  }

  async loadMoreComments(event) {
    if (this.commentsPagination.hasNextPage) {
      this.fetchingComments = true;
      await this.commentsService.getComments(this.token, this.animeOrEpisodeId, this.commentsPagination.actualPage + 1, this.commentsType, this.sortName).then(data => {
        this.fetchingComments = false;
        this.comments = this.comments.concat(data.results);
        this.commentsPagination = {
          'actualPage': this.commentsPagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }, error => {
        this.fetchingComments = false;
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

  uncensorComment(comment: any) {
    comment.reports = 0;
  }

  showDeletedComment(comment: any) {
    if (this.user.is_staff) {
      comment.reports = 0;
    }
  }

  async openReplies(comment) {
    console.log(comment);
    const modal = await this.modalCtrl.create({
      component: RepliesPage,
      cssClass: 'rounded-modal',
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
        this.blockedAnUser = true;
        this.getComments(false);
      }
    }
  }

  openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    this.getComments(false);
  }

  async toggleCommentNotifications(comment: any) {

    let animeOrEpisodeId = null;
    if (this.commentsType === 'anime') {
      animeOrEpisodeId = comment.anime;
    } else if (this.commentsType === 'episode') {
      animeOrEpisodeId = comment.episode;
    }

    let notifications = comment.notifications ? false : true;

    if (notifications) {
      var loader = await this.utils.createIonicLoader('Activando notificaciones...');
    } else {
      var loader = await this.utils.createIonicLoader('Desactivando notificaciones...');
    }
    await loader.present();

    this.commentsService.toggleCommentNotification(this.user.token, comment.id, animeOrEpisodeId, comment.comment, this.commentsType, notifications).then((response: any) => {
      loader.dismiss();
      comment.notifications = response.notifications;

      if (comment.notifications) {
        this.utils.showToast('Se han activado las notificaciones para este comentario', 1, true);
      } else {
        this.utils.showToast('Se han desactivado las notificaciones para este comentario', 1, true);
      }
    }).catch(() => {
      loader.dismiss();
      this.utils.showToast('Ha ocurrido un error al intentar cambiar la configuración de notificaciones del comentario.', 1, false);
    });

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

                this.blockedAnUser = true;
                this.getComments(false);
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
