import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { ModerationService } from 'src/app/services/moderation/moderation.service';
import { UtilsService } from 'src/app/services/utils.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  @ViewChild(IonInfiniteScroll) InfiniteScroll;
  @Input() consultedUser: any;
  @Input() token: string;

  public reports: any[] = null;
  public reportsPagination: any;
  public domain: string = environment.root_url;

  constructor(public modalCtrl: ModalController, public moderation: ModerationService, 
    public utils: UtilsService) { }

  ngOnInit() {
    this.getUserReports();
  }


  async getUserReports() {
    await this.moderation.getUserReports(this.token, this.consultedUser.id, 1).then((res) => {
      this.reports = res.results;
      this.reportsPagination = {
        'actualPage': 1,
        'hasNextPage': res.next != null,
      }
    }).catch(() => {
      this.utils.showToast('No se pudieron obtener los reportes del usuario', 1, true);
    });

  }

  async loadMoreReports(event) {
    if (this.reportsPagination.hasNextPage) {
      const nextPage = this.reportsPagination.actualPage + 1;
      await this.moderation.getUserReports(this.token, this.consultedUser.id, nextPage).then((res) => {
        this.reports = this.reports.concat(res.results);
        this.reportsPagination = {
          'actualPage': nextPage,
          'hasNextPage': res.next != null,
        }
        event.target.complete();
      }).catch(() => {
        const interval = setInterval(() => {
          this.loadMoreReports(event).then(() => {
            event.target.complete();
            clearInterval(interval);
          });
        }, 3000);
      });
    } else {
      event.target.complete();
      this.InfiniteScroll.disabled = true;
    }
  }

  async toggleRefreshReports(event) {
    await this.getUserReports();
    event.target.complete();
  }

  goBack() {
    this.modalCtrl.dismiss();
  }

}
