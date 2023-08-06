import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetButton, ActionSheetController, AlertController, IonInfiniteScroll, ModalController, Platform, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { CommentsService } from 'src/app/services/comments/comments.service';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { RepliesService } from 'src/app/services/replies/replies.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-replies',
  templateUrl: './replies.page.html',
  styleUrls: ['./replies.page.scss'],
})
export class RepliesPage implements OnInit {

  @Input() comment: any;
  @ViewChild('InfiniteScrollReplies') InfiniteScroll: IonInfiniteScroll;
  @ViewChild('replyInput') replyInput;

  public formReply: FormGroup;
  public commentType: string = "";
  public profileImage: string = "assets/icon/avatar.svg";

  public isLogged: boolean = false;
  public user: PrivateUser;
  public token: string = null;
  public blockedAnUser: boolean = false;

  public paginationInfo: any;
  public repliesPagination: any;
  public replies: any = [];
  public domain: string = environment.root_url;

  @ViewChild('sortPopover') sortPopover;
  public isSortPopoverOpened: boolean = false;
  public sortName: string = '-created_at';
  public fetchingReplies: boolean = false;
  public firstSearch: boolean = true;
  public updatingReplies: boolean = false;

  constructor(public modalCtrl: ModalController, public utils: UtilsService, public repliesService: RepliesService, 
    public platform: Platform, public localStorage: PreferencesService, public formBuilder: FormBuilder, 
    public alertCtrl: AlertController, public actionCtrl: ActionSheetController, public commentsService: CommentsService, 
    public toastCtrl: ToastController, public moderation: ModerationService) {
      this.formReply = this.formBuilder.group({
        reply: ['', [
          Validators.required
        ]]
      })
    }

  ngOnInit() {
    this.commentType = this.comment.anime != undefined ? 'anime' : 'episode';
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

      this.getReplies();
    });

    setTimeout(() => {
      this.InfiniteScroll.disabled = true;
    }, 1);
  }

  ngOnDestroy() {
    this.comment = null;
    this.commentType = null;
    this.profileImage = null;
    this.isLogged = null;
    this.user = null;
    this.paginationInfo = null;
    this.repliesPagination = null;
    this.replies = null;
    this.sortPopover = null;
    this.isSortPopoverOpened = null;
    this.sortName = null;
    this.fetchingReplies = null;
    this.firstSearch = null;
  }

  async getReplies() {
    this.fetchingReplies = true;
    await this.repliesService.getReplies(this.token, this.comment.id, 1, this.commentType, this.sortName).then((data) => {
      this.fetchingReplies = false;
      this.paginationInfo = data;
      this.firstSearch = false;

      this.replies = data.results;

      this.repliesPagination = {
        'actualPage': 1,
        'hasNextPage': this.paginationInfo.next != null,
      }

      if (this.repliesPagination.hasNextPage) {
        this.InfiniteScroll.disabled = false;
      }

    }).catch((error) => {
      this.firstSearch = false;
      this.fetchingReplies = false;
      console.log(error);
    });

  }

  async loadMoreReplies(event) {
    if (this.repliesPagination.hasNextPage) {
      this.fetchingReplies = true;
      await this.repliesService.getReplies(this.token, this.comment.id, this.repliesPagination.actualPage + 1, this.commentType, this.sortName).then(data => {
        this.fetchingReplies = false;
        this.replies = this.replies.concat(data.results);
        this.repliesPagination = {
          'actualPage': this.repliesPagination.actualPage + 1,
          'hasNextPage': data.next != null,
        }
        event.target.complete();
      }, error => {
        this.fetchingReplies = false;
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

  async sendReply() {

    const regex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
    const reply = this.formReply.value.reply;
    const hasUrl = reply.match(regex);

    if (hasUrl) {
      this.utils.showToast('No se permiten URLs en las respuestas', 1, false);
    } else {

      const loader = await this.utils.createIonicLoader('Enviando Respuesta...');
      loader.present();

      await this.repliesService.sendReply(this.comment.id, this.formReply.value.reply, this.user.token, this.commentType).then((response) => {
        if (response.success) {
          this.formReply.reset();
          this.comment.replies += 1;
          this.getReplies();
        } else {
          this.utils.showToast(response.message, 1, false);
        }
      }).catch((error) => {
        this.utils.showToast('Error al enviar la respuesta', 1, true);
      });

      loader.dismiss();
    }
  }

  async deleteReply(reply: any) {
    const loader = await this.utils.createIonicLoader('Eliminando...');
    loader.present();
    await this.repliesService.deleteReply(reply.id, this.user.token, this.commentType).then((deleted) => {
      loader.dismiss();
      if (deleted) {
        this.getReplies();
        this.utils.showToast('Respuesta eliminada', 1, false);
        this.comment.replies -= 1;
      } else {
        this.utils.showToast('Error al eliminar la respuesta', 1, true);
      }
    }).catch(() => {
      loader.dismiss();
    });
  }

  async reportReply(reply: any) {
    const loader = await this.utils.createIonicLoader('Espera...');
    loader.present();
    this.repliesService.getReportKinds(this.user.token).then(async (kinds) => {
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
        header: 'Denunciar respuesta',
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
              this.repliesService.reportReply(reply.id, kindId, this.user.token, this.commentType).then((response) => {
                loader.dismiss();
                if (response.success) {
                  this.utils.showToast(response.message, 1, false);
                  this.replies = this.replies.filter((c) => c.id != reply.id);
                } else {
                  this.utils.showToast(response.message, 1, true);
                }
              }).catch(() => {
                loader.dismiss();
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

  async openModeration(reply: any) {
    if (this.user.is_staff || this.user.groups.moderator) {
      let buttons: ActionSheetButton[] = [
        {
          text: 'Cerrar',
          icon: 'close',
          role: 'cancel'
        }
      ];
      if (reply.user.is_active) {
        buttons.unshift({
          text: 'Banear usuario',
          icon: 'ban',
          handler: () => {
            this.banUser(reply.user);
          }
        });
      } else {
        buttons.unshift({
          text: 'Desbanear usuario',
          icon: 'ban',
          handler: () => {
            this.unbanUser(reply.user);
          }
        });
      }

      if (this.user.is_staff) {
        buttons.push({
          text: 'Eliminar respuesta',
          icon: 'trash',
          handler: async () => {
            this.alertCtrl.create({
              header: 'Eliminar respuesta',
              message: '¿Estás seguro de que quieres eliminar esta respuesta?',
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
                    this.deleteReply(reply);
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

  async openReplyOptions(reply: any) {

    var buttons = [];
    // Comentario propio
    if (this.user.email === reply.user.email) {
      buttons = [
        {
          text: 'Eliminar respuesta',
          icon: 'trash',
          handler: async () => {
            this.alertCtrl.create({
              header: 'Eliminar respuesta',
              message: '¿Estás seguro de que quieres eliminar tu respuesta?',
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
                    this.deleteReply(reply);
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
          text: 'Bloquear a ' + reply.user.username,
          icon: 'person-remove',
          handler: () => {
            this.blockUser(reply.user);
          }
        },
        {
          text: 'Denunciar respuesta',
          icon: 'flag',
          handler: () => {
            this.reportReply(reply);
          }
        },
        {
          text: 'Reportar a ' + reply.user.username,
          icon: 'flag',
          handler: () => {
            this.reportUser(reply.user);
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

  uncensorReply(reply: any) {
    reply.reports = 0;
  }

  showDeletedReply(reply: any) {
    if (this.user.is_staff) {
      reply.reports = 0;
    }
  }

  async toggleRefresh(event) {
    this.updatingReplies = true;
    await this.getReplies();
    event.target.complete();
  }

  closeModal() {
    this.modalCtrl.dismiss({
      'blockedAnUser': this.blockedAnUser
    });
  }

  replyReply(reply) {
    //add @username to reply
    this.formReply.patchValue({
      reply: '@' + reply.user.username + ' '
    });

    //focus on reply input
    this.replyInput.setFocus();
  }

  openSortPopover(e: Event) {
    this.sortPopover.event = e;
    this.isSortPopoverOpened = true;
  }

  sort(sortName) {
    this.sortName = sortName;
    this.isSortPopoverOpened = false;
    this.getReplies();
  }

  async toggleCommentNotifications(comment: any) {

    let animeOrEpisodeId = null;
    if (this.commentType === 'anime') {
      animeOrEpisodeId = comment.anime;
    } else if (this.commentType === 'episode') {
      animeOrEpisodeId = comment.episode;
    }

    let notifications = comment.notifications ? false : true;

    if (notifications) {
      var loader = await this.utils.createIonicLoader('Activando notificaciones...');
    } else {
      var loader = await this.utils.createIonicLoader('Desactivando notificaciones...');
    }
    await loader.present();

    this.commentsService.toggleCommentNotification(this.user.token, comment.id, animeOrEpisodeId, comment.comment, this.commentType, notifications).then((response: any) => {
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

                this.blockedAnUser = true;

                if (user.id == this.comment.user.id) {
                  this.closeModal();
                } else {
                  this.getReplies();
                }
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
