import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Settings } from 'src/app/classes/settings/settings/settings';
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
  biometricLoginToggle: boolean = false;

  @ViewChild('toolbar', { read: ElementRef }) toolbar: ElementRef;

  constructor(public navCtrl: NavController, public platform: Platform, public localStorage: PreferencesService) {
    
  }

  ngOnInit() {
    
    this.platform.ready().then(async () => {
      // if (this.platform.is('android')) {
      //   this.utils.applyStatusBarHeight(this.toolbar.nativeElement);
      // }

      const settings = await this.localStorage.getSettings();
      this.pipToggle = settings.pipEnabled;
      this.chromecastToggle = settings.chromecastEnabled;
      this.aditionalProvidersToggle = settings.aditionalProviders;
    });
  }

  toggle(event) {
    let checked = event.detail.checked;
    let value = event.target.value;
    let settings = new Settings();
    settings.pipEnabled = this.pipToggle;
    settings.chromecastEnabled = this.chromecastToggle;
    settings.aditionalProviders = this.aditionalProvidersToggle;


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

}
