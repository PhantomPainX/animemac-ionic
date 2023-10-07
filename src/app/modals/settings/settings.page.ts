import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';
import { Settings } from 'src/app/interfaces/settings';
import { Themes } from 'src/app/interfaces/themes';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  //Reproductor de video
  pipToggle: boolean = false;
  chromecastToggle: boolean = false;
  aditionalProvidersToggle: boolean = false;
  public themeOptions: Themes = {
    dark: false,
    light: false,
    system: true
  };
  public theme: string = '';

  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;

  // Is lite version
  public liteVersion: boolean = environment.liteVersion;

  constructor(public navCtrl: NavController, public platform: Platform, public localStorage: PreferencesService, 
    private sharingService: SharingService) {
    
  }

  ngOnInit() {
    
    this.platform.ready().then(async () => {
      // if (this.platform.is('android')) {
      //   this.utils.applyStatusBarHeight(this.toolbar.nativeElement);
      // }

      const settings = await this.localStorage.getSettings();
      if (settings.theme == undefined) {
        settings.theme = {
          dark: false,
          light: false,
          system: true
        };
        await this.localStorage.setSettings(settings);
      } 

      this.pipToggle = settings.pipEnabled;
      this.chromecastToggle = settings.chromecastEnabled;
      this.aditionalProvidersToggle = settings.aditionalProviders;
      this.themeOptions = settings.theme;
      if (this.themeOptions.dark) {
        this.theme = 'dark';
      } else if (this.themeOptions.light) {
        this.theme = 'light';
      } else if (this.themeOptions.system) {
        this.theme = 'system';
      }
    });
  }

  toggle(event) {
    let checked = event.detail.checked;
    let value = event.target.value;
    let settings: Settings = {
      pipEnabled: this.pipToggle,
      chromecastEnabled: this.chromecastToggle,
      aditionalProviders: this.aditionalProvidersToggle,
      theme: this.themeOptions
    };


    if (value == 'pip') {
      settings.pipEnabled = checked;
      this.pipToggle = checked;
    } else if (value == 'chromecast') {
      settings.chromecastEnabled = checked;
      this.chromecastToggle = checked;
    } else if (value == 'aditionalProviders') {
      settings.aditionalProviders = checked;
      this.aditionalProvidersToggle = checked;
    } 
    this.localStorage.setSettings(settings);
  }

  public changeTheme(event) {
    let value = event.target.value;
    let settings: Settings = {
      pipEnabled: this.pipToggle,
      chromecastEnabled: this.chromecastToggle,
      aditionalProviders: this.aditionalProvidersToggle,
      theme: this.themeOptions
    };

    if (value == 'dark') {
      settings.theme.dark = true;
      settings.theme.light = false;
      settings.theme.system = false;
      this.theme = 'dark';
    } else if (value == 'light') {
      settings.theme.dark = false;
      settings.theme.light = true;
      settings.theme.system = false;
      this.theme = 'light';
    } else if (value == 'system') {
      settings.theme.dark = false;
      settings.theme.light = false;
      settings.theme.system = true;
      this.theme = 'system';
    }

    this.localStorage.setSettings(settings);
    this.sharingService.emitThemeChanged(settings.theme);
  }

}
