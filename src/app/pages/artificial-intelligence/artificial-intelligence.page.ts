import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PoeService } from 'src/app/services/poe/poe.service';
import { environment } from 'src/environments/environment.prod';
import { Browser } from '@capacitor/browser';
import { EpisodePage } from '../episode/episode.page';
import { UtilsService } from 'src/app/services/utils.service';
import { MysqlDatabaseService } from 'src/app/services/mysql-database.service';
import { ModalController, NavController } from '@ionic/angular';
import { webSocket } from 'rxjs/webSocket';

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

  private subject: any;
  public waitingWsChunkResponse: boolean = false;
  public gettingWsMessage: boolean = false;
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
    console.log(rand_number);
    this.connect("wss://animemac.net/ws/gpt35-premade-question/" + rand_number + "/");
    this.initialize();
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
        } else if (msg.status && msg.data.msg_identifier == "all_chunks_sent") {
          this.gettingWsMessage = false;
        } else if (!msg.status) {
          this.gettingWsMessage = false;
          this.waitingWsChunkResponse = false;
          this.wsConnectionEnded = true;
        }
      }, // Called whenever there is a message from the server.
      error: err => {
        console.log(err);
        this.gettingWsMessage = false;
        this.waitingWsChunkResponse = false;
        this.wsConnectionEnded = true;
      }, // Called if at any point WebSocket API signals some kind of error.
      complete: () => {
        this.gettingWsMessage = false;
        this.waitingWsChunkResponse = false;
        this.wsConnectionEnded = true;
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

    const interval = setInterval(() => {
      this.seconds++;
      //cada 5 segundos se actualiza el fact
      if (this.seconds % 10 == 0) {
        this.showFact = true;
        this.fact = this.randomFact();
      }
    }, 1000);
    if (this.type == "resume_no_spoilers") {
      this.gettingData = false;
      this.waitingWsChunkResponse = true;
      this.gettingWsMessage = true;
      clearInterval(interval);
      this.subject.next({
        "anime_name": this.anime_name,
        "question_type": this.type
      });
    } else if (this.type == "resume") {
      this.gettingData = false;
      this.waitingWsChunkResponse = true;
      this.gettingWsMessage = true;
      clearInterval(interval);
      this.subject.next({
        "anime_name": this.anime_name,
        "question_type": this.type
      });
    } else if (this.type == "interesting_facts") {
      this.poeService.getInterestingFacts(this.anime_name).then((data: any) => {
        console.log(data);
        this.interestingFacts = data.interesting_facts;
        if (this.interestingFacts == null) {
          this.error = "No pude encontrar curiosidades de este anime, disculpa :(";
        }
        this.gettingData = false;
        clearInterval(interval);
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
        clearInterval(interval);
      }).catch(() => this.cancel());
    } else if (this.type == "staff") {
      this.poeService.getStaff(this.anime_name).then((data: any) => {
        this.staff = data.staff;
        if (this.staff == null) {
          this.error = "No pude encontrar el staff de este anime, disculpa :(";
        }
        this.gettingData = false;
        clearInterval(interval);
      }).catch(() => this.cancel());
    } else if (this.type == "relevant_episodes") {
      this.poeService.getRelevantEpisodes(this.anime_name).then((data: any) => {
        this.relevantEpisodes = data.relevant_episodes;
        if (this.relevantEpisodes == null) {
          this.error = "No pude encontrar episodios relevantes de este anime, disculpa :(";
        }
        this.gettingData = false;
        clearInterval(interval);
      }).catch(() => this.cancel());
    } else if (this.type == "recommendations") {
      this.poeService.getRecommendations(this.anime_name).then((data: any) => {
        this.recommendations = data.recommendations;
        if (this.recommendations == null) {
          this.error = "No pude encontrar recomendaciones basadas de este anime, disculpa :(";
        }
        this.gettingData = false;
        clearInterval(interval);
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
    this.initialize();
  }

  openAiPopover(e: Event) {
    this.aiPopover.event = e;
    this.isAiPopoverOpened = true;
  }

  cancel() {
    this.gettingData = false;
    this.error = "Me morí, disculpa... Refresca chip de memoria y vuelve a intentarlo :(";
  }

  public facts: any[] = [
    {
      "curiosidad": "En Japón hay más de 6,800 islas."
    },
    {
      "curiosidad": "El nombre oficial de Japón es Nippon-koku, que significa 'Estado del Sol Naciente'."
    },
    {
      "curiosidad": "Japón tiene la mayor expectativa de vida en el mundo, con una esperanza de vida de 84 años."
    },
    {
      "curiosidad": "El sushi se comía tradicionalmente con los dedos."
    },
    {
      "curiosidad": "El Monte Fuji es la montaña más alta de Japón y es considerado un lugar sagrado."
    },
    {
      "curiosidad": "En Japón es común quitarse los zapatos antes de entrar a una casa o edificio."
    },
    {
      "curiosidad": "El shinkansen, o tren bala, es uno de los medios de transporte más rápidos del mundo."
    },
    {
      "curiosidad": "Japón tiene más de 50,000 máquinas expendedoras de todo tipo de productos."
    },
    {
      "curiosidad": "El anime y el manga son formas populares de entretenimiento en Japón."
    },
    {
      "curiosidad": "En Japón existe la palabra 'karoshi', que se refiere a la muerte por exceso de trabajo."
    },
    {
      "curiosidad": "La ceremonia del té es una práctica tradicional en Japón que se centra en la preparación y consumo de té verde."
    },
    {
      "curiosidad": "Japón es el hogar de la tecnología de robots más avanzada del mundo."
    },
    {
      "curiosidad": "El sakura, o cerezo en flor, es una flor nacional en Japón y es un símbolo de la primavera y la renovación."
    },
    {
      "curiosidad": "En Japón, el número 4 se considera de mala suerte porque suena similar a la palabra 'muerte'."
    },
    {
      "curiosidad": "Los baños termales, o onsen, son populares en Japón y se cree que tienen beneficios para la salud."
    },
    {
      "curiosidad": "Existe una práctica de limpieza llamada 'oshibori', que consiste en limpiarse las manos y la cara con una toalla caliente antes de comer."
    },
    {
      "curiosidad": "Japón tiene más de 5,000 islas deshabitadas."
    },
    {
      "curiosidad": "En Japón es común que los estudiantes limpien su propia escuela como parte de su educación."
    },
    {
      "curiosidad": "El karaoke, una forma de entretenimiento que implica cantar en público, comenzó en Japón."
    },
    {
      "curiosidad": "El wasabi, una pasta verde picante que se usa comúnmente con sushi, se obtiene de la raíz de la planta wasabi."
    },
    {
      "curiosidad": "Japón tiene más de 200 estaciones de esquí."
    },
    {
      "curiosidad": "El ramen, un plato de fideos que se sirve en un caldo, es una comida rápida popular en Japón."
    },
    {
      "curiosidad": "En Japón es común que las personas se bañen antes de entrar a una piscina pública."
    },
    {
      "curiosidad": "La flor del crisantemo es el emblema nacional de Japón y se puede encontrar en muchas decoraciones y obras de arte."
    },
    {
      "curiosidad": "El 'pachinko', un juego de azar similar a una máquina tragamonedas, es extremadamente popular en Japón."
    },
    {
      "curiosidad": "En Japón, el año nuevo es una festividad importante que se celebra en familia."
    },
    {
      "curiosidad": "El sumo es un deporte tradicional en Japón que involucra a dos luchadores que intentan empujar al otro fuera del ring."
    },
    {
      "curiosidad": "El arte del origami, o plegado de papel, se originó en Japón y es popular en todo el mundo."
    },
    {
      "curiosidad": "Japón es el hogar de algunas de las marcas de automóviles más conocidas, como Toyota, Honda, Nissan y Mitsubishi."
    },
    {
      "curiosidad": "Los japoneses valoran la puntualidad y se espera que las personas lleguen a tiempo a las citas y reuniones."
    },
    {
      "curiosidad": "La animación japonesa, conocida como anime, se caracteriza por su estilo visual distintivo."
    },
    {
      "curiosidad": "El anime se originó en Japón en la década de 1910 y se ha convertido en un fenómeno cultural global."
    },
    {
      "curiosidad": "El anime abarca una amplia variedad de géneros, como acción, comedia, drama, fantasía, romance y ciencia ficción."
    },
    {
      "curiosidad": "A menudo, el anime se basa en series de manga populares."
    },
    {
      "curiosidad": "La animación se produce en estudios de animación en Japón, y algunos de los más famosos incluyen Studio Ghibli, Gainax y Kyoto Animation."
    },
    {
      "curiosidad": "El anime a menudo presenta personajes con grandes ojos expresivos y estilos de cabello distintivos."
    },
    {
      "curiosidad": "La música es un elemento importante del anime, que puede ser tanto original como licenciada."
    },
    {
      "curiosidad": "El anime ha ganado popularidad en todo el mundo y ha sido doblado en muchos idiomas diferentes."
    },
    {
      "curiosidad": "La animación ha sido nominada y ha ganado varios premios, incluyendo el Premio de la Academia Japonesa al Mejor Largometraje de Animación."
    },
    {
      "curiosidad": "El anime también se ha adaptado a películas de acción en vivo, como en la película de Hollywood 'Ghost in the Shell'."
    },
    {
      "curiosidad": "El anime a menudo presenta temas profundos y complejos, como la identidad, la moralidad y la filosofía."
    },
    {
      "curiosidad": "La animación se ha convertido en una forma importante de promoción para muchas marcas y productos en Japón."
    },
    {
      "curiosidad": "El anime también ha inspirado a muchos fanáticos para crear su propio arte y ficción, en un fenómeno conocido como 'fan fiction' o 'fanart'."
    },
    {
      "curiosidad": "La animación ha sido objeto de estudios académicos y se ha utilizado como una forma de enseñanza en algunas escuelas y universidades."
    },
    {
      "curiosidad": "El anime también ha inspirado a muchos cosplayers, que se visten como sus personajes favoritos en convenciones y eventos de anime."
    },
    {
      "curiosidad": "La animación ha inspirado a muchos artistas de manga y anime occidentales, incluyendo a algunos de los más famosos de la industria."
    },
    {
      "curiosidad": "El anime también se ha adaptado a videojuegos, con muchos juegos basados en series de anime populares."
    },
    {
      "curiosidad": "La animación ha sido objeto de parodias y sátiras en otros programas de televisión y películas."
    },
    {
      "curiosidad": "El anime también ha inspirado a muchos músicos y bandas, que han creado canciones y álbumes basados en series de anime populares."
    },
    {
      "curiosidad": "La representación de la violencia y la sexualidad en el anime ha sido objeto de controversia."
    },
    {
      "curiosidad": "La representación de ciertos grupos étnicos y culturales en el anime también ha sido criticada."
    },
    {
      "curiosidad": "El anime ha inspirado una gran cantidad de productos derivados, como juguetes, ropa y videojuegos."
    },
    {
      "curiosidad": "La animación ha influido en la cultura popular en todo el mundo, desde la moda hasta la música y el entretenimiento."
    },
    {
      "curiosidad": "El anime también se utiliza a menudo para educar a las personas sobre la cultura y la historia japonesa."
    },
    {
      "curiosidad": "La animación ha inspirado a muchos artistas y creadores de todo el mundo, incluyendo a algunos de los más famosos de la industria del entretenimiento."
    },
    {
      "curiosidad": "Los memes y las bromas en línea basados en el anime se han vuelto extremadamente populares."
    },
    {
      "curiosidad": "El anime ha inspirado a muchos músicos y bandas, que han creado canciones y álbumes basados en series de anime populares."
    },
    {
      "curiosidad": "La animación también ha inspirado a muchos fanáticos para crear su propio arte y ficción, en un fenómeno conocido como 'fan fiction' o 'fanart'."
    },
    {
      "curiosidad": "El anime también ha inspirado a muchos cosplayers, que se visten como sus personajes favoritos en convenciones y eventos."
    }
  ]

  randomFact(): string {
    let fact = this.facts[Math.floor(Math.random() * this.facts.length)];
    this.facts = this.facts.filter(item => item !== fact);
    return fact.curiosidad;
  }

}
