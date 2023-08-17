import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { SharingService } from 'src/app/core/services/sharing/sharing.service';
import { Settings } from 'src/app/interfaces/settings';
import { PreferencesService } from 'src/app/services/preferences/preferences.service';

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
  public darkThemeToggle: boolean = false;

  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;

  constructor(public navCtrl: NavController, public platform: Platform, public localStorage: PreferencesService, 
    private sharingService: SharingService) {
    
  }

  ngOnInit() {
    
    this.platform.ready().then(async () => {
      // if (this.platform.is('android')) {
      //   this.utils.applyStatusBarHeight(this.toolbar.nativeElement);
      // }

      const settings = await this.localStorage.getSettings();
      console.log(settings);
      if (settings.darkTheme == undefined) {
        settings.darkTheme = false;
        await this.localStorage.setSettings(settings);
      } 

      this.pipToggle = settings.pipEnabled;
      console.log("pip:", this.pipToggle);
      this.chromecastToggle = settings.chromecastEnabled;
      this.aditionalProvidersToggle = settings.aditionalProviders;
      this.darkThemeToggle = settings.darkTheme;
    });
  }

  toggle(event) {
    let checked = event.detail.checked;
    let value = event.target.value;
    let settings: Settings = {
      pipEnabled: this.pipToggle,
      chromecastEnabled: this.chromecastToggle,
      aditionalProviders: this.aditionalProvidersToggle,
      darkTheme: this.darkThemeToggle
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
    } else if (value == 'darkTheme') {
      settings.darkTheme = checked;
      this.darkThemeToggle = checked;
      this.sharingService.emitThemeChanged(checked);
    }

    this.localStorage.setSettings(settings);
  }

}
