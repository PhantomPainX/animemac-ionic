import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoeService } from 'src/app/services/poe/poe.service';
import { environment } from 'src/environments/environment.prod';
import { Browser } from '@capacitor/browser';
import { EpisodePage } from '../episode/episode.page';
import { UtilsService } from 'src/app/services/utils.service';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { ModalController, NavController } from '@ionic/angular';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Component({
  selector: 'app-artificial-intelligence',
  templateUrl: './artificial-intelligence.page.html',
  styleUrls: ['./artificial-intelligence.page.scss'],
})
export class ArtificialIntelligencePage implements OnInit {

  @ViewChild('aiPopover') aiPopover;
  public isAiPopoverOpened: boolean = false;

  public domain: string = environment.root_url;
  public type: string;
  public anime_name: string;
  public image: string;

  public title: string;
  public gettingData: boolean = false;
  public seconds: number = 1;
  public showFact: boolean = false;
  public animeid: number;
  public token: string;
  public anime: any;
  public fact: string = "";

  public resume: string = "";
  public interestingFacts: any[] = [];
  public characters: any[] = [];
  public staff: any[] = [];
  public relevantEpisodes: any[] = [];
  public recommendations: any[] = [];
  public error = "";

  private subject: WebSocketSubject<any>;
  public waitingWsChunkResponse: boolean = false;
  public sendingWsChunk: boolean = false;
  public wsConnectionEnded: boolean = false;

  constructor(public activatedRoute: ActivatedRoute, public poeService: PoeService, public modalCtrl: ModalController, 
    public utils: UtilsService, public database: MysqlDatabaseService, public navCtrl: NavController) {
    this.type = this.activatedRoute.snapshot.params.type;
    this.anime_name = this.activatedRoute.snapshot.params.anime_name;
    this.animeid = this.activatedRoute.snapshot.params.animeid;
    this.token = this.activatedRoute.snapshot.params.token;
    this.image = this.activatedRoute.snapshot.params.image;
    this.image = this.domain + "/media/portadas/" + this.image + ".webp";

  }

  ngOnInit() {
    const rand_number = Math.floor(Math.random() * 9999999999) + 1;
    this.connect("wss://animemac.net/ws/gpt35-premade-question/" + rand_number + "/");
    this.openAI(this.type);
    // this.initialize();
  }

  ngOnDestroy() {
    this.subject.complete();
    this.subject.unsubscribe();
  }

  public connect(url) {
    this.subject = webSocket(url);
    this.subject.subscribe({
      next: msg => {
        // console.log(msg);
        if (msg.status && msg.data.msg_identifier == "sending_chunk") {
          this.resume += msg.data.chunk;
          this.waitingWsChunkResponse = false;
          this.gettingData = false;
          this.sendingWsChunk = true;
        } else if (msg.status && msg.data.msg_identifier == "all_chunks_sent") {
          this.gettingData = false;
          this.waitingWsChunkResponse = false;
          this.sendingWsChunk = false;
        } else if (!msg.status) {
          this.gettingData = false;
          this.waitingWsChunkResponse = false;
          this.wsConnectionEnded = true;
          this.sendingWsChunk = false;
        }
      }, // Called whenever there is a message from the server.
      error: err => {
        console.log(err);
        this.gettingData = false;
        this.waitingWsChunkResponse = false;
        this.wsConnectionEnded = true;
        this.sendingWsChunk = false;
      }, // Called if at any point WebSocket API signals some kind of error.
      complete: () => {
        this.gettingData = false;
        this.waitingWsChunkResponse = false;
        this.wsConnectionEnded = true;
        this.sendingWsChunk = false;
      } // Called when connection is closed (for whatever reason).
     });
  }

  initialize() {
    if (this.type == "resume_no_spoilers") {
      this.title = "Resumen sin spoilers";
    } else if (this.type == "resume") {
      this.title = "Resumen con spoilers";
    } else if (this.type == "interesting_facts") {
      this.title = "Curiosidades";
    } else if (this.type == "characters") {
      this.title = "Personajes";
    } else if (this.type == "staff") {
      this.title = "Staff";
    } else if (this.type == "relevant_episodes") {
      this.title = "Episodios relevantes";
    } else if (this.type == "recommendations") {
      this.title = "Recomendaciones basadas en";
    }

    if (this.type == "resume_no_spoilers") {
      this.waitingWsChunkResponse = true;
      this.subject.next({
        "anime_name": this.anime_name,
        "question_type": this.type
      });
    } else if (this.type == "resume") {
      this.waitingWsChunkResponse = true;
      this.subject.next({
        "anime_name": this.anime_name,
        "question_type": this.type
      });
    } else if (this.type == "interesting_facts") {
      this.poeService.getInterestingFacts(this.anime_name).then((data: any) => {
        this.interestingFacts = data.interesting_facts;
        if (this.interestingFacts == null) {
          this.error = "No pude encontrar curiosidades de este anime, disculpa :(";
        }
        this.gettingData = false;
      }).catch(() => this.cancel());
    } else if (this.type == "characters") {
      this.poeService.getCharacters(this.anime_name).then((data: any) => {
        this.characters = data.characters;
        //reemplaza las imagenes de todos los caracteres por la imagen de la portada
        for (let i = 0; i < this.characters.length; i++) {
          this.characters[i].imagen = "assets/icon/default.webp";
        }
        if (this.characters == null) {
          this.error = "No pude encontrar personajes de este anime, disculpa :(";
        }
        this.gettingData = false;
      }).catch(() => this.cancel());
    } else if (this.type == "staff") {
      this.poeService.getStaff(this.anime_name).then((data: any) => {
        this.staff = data.staff;
        if (this.staff == null) {
          this.error = "No pude encontrar el staff de este anime, disculpa :(";
        }
        this.gettingData = false;
      }).catch(() => this.cancel());
    } else if (this.type == "relevant_episodes") {
      this.poeService.getRelevantEpisodes(this.anime_name).then((data: any) => {
        this.relevantEpisodes = data.relevant_episodes;
        if (this.relevantEpisodes == null) {
          this.error = "No pude encontrar episodios relevantes de este anime, disculpa :(";
        }
        this.gettingData = false;
      }).catch(() => this.cancel());
    } else if (this.type == "recommendations") {
      this.poeService.getRecommendations(this.anime_name).then((data: any) => {
        this.recommendations = data.recommendations;
        if (this.recommendations == null) {
          this.error = "No pude encontrar recomendaciones basadas de este anime, disculpa :(";
        }
        this.gettingData = false;
      }).catch(() => this.cancel());
    }
  }

  search(string: string) {
    string = string.replace(" ", "+");
    const query = "https://www.google.com/search?q=" + string;
    console.log("query: " + query);
    Browser.open({ url: query });
  }

  async findAnime(anime_name: string) {
    const loader = await this.utils.createIonicLoader("Buscando...");
    loader.present();
    this.database.findAnime(anime_name, 1, this.token).then((data) => {
      loader.dismiss();
      const results = data.results;
      if (data.count > 0) {
        //find exact match with the name in results
        const exactMatch = results.find((result) => {
          return result.nombre.toLowerCase() === anime_name.toLowerCase();
        });
        if (exactMatch) {
          this.navCtrl.navigateForward('/detail/'+exactMatch.id, { animated: true, animationDirection: 'forward' });
        } else {
          this.utils.showToast("No se encontro ese anime en nuestros registros", 1, true);
        }
      } else {
        this.utils.showToast("No se encontro ese anime en nuestros registros", 1, true);
      }
    }).catch(error => {
      console.log(error);
      loader.dismiss();
      this.utils.showToast("Error al obtener ese anime", 1, true);
    });
  }

  async openEpisodes(numero: number) {
    const loader = await this.utils.createIonicLoader("Espera por favor...");
    loader.present();
    this.anime = await this.database.getAnimeDetail(this.animeid, this.token);
    loader.dismiss();
    const modal = await this.modalCtrl.create({
      component: EpisodePage,
      cssClass: 'rounded-modal',
      canDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      componentProps: {
        anime: this.anime,
        totalEpisodes: this.anime.episodios.length,
        searchEp: numero
      }
    });
    await modal.present();
  }

  openAI(type: string) {
    this.isAiPopoverOpened = false;
    this.seconds = 1;
    this.type = type;
    this.gettingData = true;
    this.error = "";
    this.resume = "";
    this.interestingFacts = [];
    this.characters = [];
    this.staff = [];
    this.relevantEpisodes = [];
    this.recommendations = [];
    this.sendingWsChunk = false;
    this.initialize();
  }

  openAiPopover(e: Event) {
    this.aiPopover.event = e;
    this.isAiPopoverOpened = true;
  }

  cancel() {
    this.gettingData = false;
    this.error = "Ocurrio un error al obtener la información, disculpa :(";
  }

}
