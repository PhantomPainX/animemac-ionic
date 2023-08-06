import { Injectable } from '@angular/core';
import { KeysResult, Preferences } from '@capacitor/preferences';
import { PrivateUser } from 'src/app/classes/private-user/private-user';
import { Settings } from 'src/app/classes/settings/settings/settings';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() { }

  // [START] - User preferences

  async userFirstTime(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'userFirstTime' });
    if (value === null) {
      return null;
    } else {
      return (value === 'true') ? true : false;
    }
  }

  async setUserFirstTime(userFirstTime: boolean): Promise<void> {
    await Preferences.set({
      key: 'userFirstTime',
      value: JSON.stringify(userFirstTime)
    });
  }

  async getLogged(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'logged' });
    return (value === 'true') ? true : false || null;
  }

  async setLogged(logged: boolean): Promise<void> {
    await Preferences.set({
      key: 'logged',
      value: JSON.stringify(logged)
    });
  }

  async getGuest(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'guest' });
    return (value === 'true') ? true : false || null;
  }

  async setGuest(guest: boolean): Promise<void> {
    await Preferences.set({
      key: 'guest',
      value: JSON.stringify(guest)
    });
  }

  async getAcceptedTerms(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'acceptedTerms' });
    return (value === 'true') ? true : false || null;
  }

  async setAcceptedTerms(acceptedTerms: boolean): Promise<void> {
    await Preferences.set({
      key: 'acceptedTerms',
      value: JSON.stringify(acceptedTerms)
    });
  }

  async getGoogleLogin(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'googleLogin' });
    return (value === 'true') ? true : false || null;
  }

  async setGoogleLogin(googleLogin: boolean): Promise<void> {
    await Preferences.set({
      key: 'googleLogin',
      value: JSON.stringify(googleLogin)
    });
  }

  async getUser(): Promise<PrivateUser> {
    const { value } = await Preferences.get({ key: 'user' });
    return JSON.parse(value);
  }

  async setUser(user: PrivateUser): Promise<void> {
    await Preferences.set({
      key: 'user',
      value: JSON.stringify(user)
    });
  }

  async removeUser(): Promise<void> {
    await Preferences.remove({ key: 'user' });
  }

  // [END] - User preferences

  // [START] - Biometric preferences

  async getKnownKeys(): Promise<KeysResult> {
    return await Preferences.keys();
  }

  async userHasBiometricCredentials(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'userHasBiometricCredentials' });
    if (value === null) {
      return null;
    } else {
      return (value === 'true') ? true : false;
    }
  }

  async setUserHasBiometricCredentials(userHasBiometricCredentials: boolean): Promise<void> {
    await Preferences.set({
      key: 'userHasBiometricCredentials',
      value: JSON.stringify(userHasBiometricCredentials)
    });
  }

  async biometricCompatible(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'biometricCompatible' });
    if (value === null) {
      return null;
    } else {
      return (value === 'true') ? true : false;
    }
  }

  async setBiometricCompatible(biometricCompatible: boolean): Promise<void> {
    await Preferences.set({
      key: 'biometricCompatible',
      value: JSON.stringify(biometricCompatible)
    });
  }

  // [END] - Biometric preferences
    
  // [START] - Settings preferences
  async getSettings(): Promise<Settings> {
    const { value } = await Preferences.get({ key: 'settings' });
    return JSON.parse(value);
  }

  async setSettings(settings: Settings): Promise<void> {
    await Preferences.set({
      key: 'settings',
      value: JSON.stringify(settings)
    });
  }
  // [END] - Settings preferences

  // [START] - App Rated preferences
  async setRatedApp(ratedApp: boolean): Promise<void> {
    await Preferences.set({
      key: 'ratedApp',
      value: JSON.stringify(ratedApp)
    });
  }

  async getRatedApp(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'ratedApp' });
    return (value === 'true') ? true : false || null;
  }

  async setTimeOnApp(timeOnApp: number): Promise<void> {
    await Preferences.set({
      key: 'timeOnApp',
      value: JSON.stringify(timeOnApp)
    });
  }

  async getTimeOnApp(): Promise<number> {
    const { value } = await Preferences.get({ key: 'timeOnApp' });
    return JSON.parse(value);
  }

  async resetTimeOnApp(): Promise<void> {
    await Preferences.remove({ key: 'timeOnApp' });
  }
  // [END] - App Rated preferences

  // [START] - Video downloads preferences
  async getIsDownloading(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'isDownloading' });
    return (value === 'true') ? true : false || null;
  }

  async setIsDownloading(isDownloading: boolean): Promise<void> {
    await Preferences.set({
      key: 'isDownloading',
      value: JSON.stringify(isDownloading)
    });
  }
  // [END] - Video downloads preferences

  // [START] - Video ADS preferences
  async getDeserveAd(): Promise<boolean> {
    const value = JSON.parse(localStorage.getItem('deserveAd'));
    return value;
  }

  async setDeserveAd(deserveAd: boolean): Promise<void> {
    localStorage.setItem('deserveAd', JSON.stringify(deserveAd));
  }

  async getWithoutAdVideoViews(): Promise<number> {
    const value = JSON.parse(localStorage.getItem('withoutAdVideoViews'));
    return value;
  }

  async setWithoutAdVideoViews(withoutAdVideoViews: number): Promise<void> {
    localStorage.setItem('withoutAdVideoViews', JSON.stringify(withoutAdVideoViews));
  }
  // [END] - Video ADS preferences

  // [START] - Episodes Autoplay preferences
  async setAutoplay(animeId: number, autoplay: boolean): Promise<void> {

    const { value } = await Preferences.get({ key: 'autoplay' });
    if (value !== null) {
      const autoplayArray = JSON.parse(value);
      autoplayArray.push({
        animeId: animeId,
        autoplay: autoplay
      })
      await Preferences.set({
        key: 'autoplay',
        value: JSON.stringify(autoplayArray)
      });
    } else {
      const autoplayArray = [];
      autoplayArray.push({
        animeId: animeId,
        autoplay: autoplay
      })
      await Preferences.set({
        key: 'autoplay',
        value: JSON.stringify(autoplayArray)
      });
    }
  }

  async removeAutoplay(animeId: number): Promise<void> {
    const { value } = await Preferences.get({ key: 'autoplay' });
    if (value !== null) {
      const autoplayArray = JSON.parse(value);
      const autoplay = autoplayArray.find(autoplay => autoplay.animeId === animeId);
      if (autoplay !== undefined) {
        const index = autoplayArray.indexOf(autoplay);
        autoplayArray.splice(index, 1);
        await Preferences.set({
          key: 'autoplay',
          value: JSON.stringify(autoplayArray)
        });
      }
    }
  }

  async getAutoplay(animeId: number): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'autoplay' });
    if (value !== null) {
      const autoplayArray = JSON.parse(value);
      const autoplay = autoplayArray.find(autoplay => autoplay.animeId === animeId);
      if (autoplay !== undefined) {
        return autoplay.autoplay;
      } else {
        return null;
      }
    }
  }

  async setAutoplayPreferences(animeId: number, providerName: string, videoProviderDomains: string[], videoProviderQuality: string): Promise<void> {
    const { value } = await Preferences.get({ key: 'autoplayPreferences' });
    if (value !== null) {
      const autoplayPreferencesArray = JSON.parse(value);

      //check if the animeId already exists
      const autoplayPreferences = autoplayPreferencesArray.find(autoplayPreferences => autoplayPreferences.animeId === animeId);
      if (autoplayPreferences !== undefined) {
        const index = autoplayPreferencesArray.indexOf(autoplayPreferences);
        autoplayPreferencesArray.splice(index, 1);
      }

      autoplayPreferencesArray.push({
        animeId: animeId,
        providerName: providerName,
        videoProviderDomains: videoProviderDomains,
        videoProviderQuality: videoProviderQuality
      })
      await Preferences.set({
        key: 'autoplayPreferences',
        value: JSON.stringify(autoplayPreferencesArray)
      });
    } else {
      const autoplayPreferencesArray = [];
      autoplayPreferencesArray.push({
        animeId: animeId,
        providerName: providerName,
        videoProviderDomains: videoProviderDomains,
        videoProviderQuality: videoProviderQuality
      })
      await Preferences.set({
        key: 'autoplayPreferences',
        value: JSON.stringify(autoplayPreferencesArray)
      });
    }
  }

  async removeAutoplayPreferences(animeId: number): Promise<void> {
    const { value } = await Preferences.get({ key: 'autoplayPreferences' });
    if (value !== null) {
      const autoplayPreferencesArray = JSON.parse(value);
      const autoplayPreferences = autoplayPreferencesArray.find(autoplayPreferences => autoplayPreferences.animeId === animeId);
      if (autoplayPreferences !== undefined) {
        const index = autoplayPreferencesArray.indexOf(autoplayPreferences);
        autoplayPreferencesArray.splice(index, 1);
        await Preferences.set({
          key: 'autoplayPreferences',
          value: JSON.stringify(autoplayPreferencesArray)
        });
      }
    }
  }

  async getAutoplayPreferences(animeId: number): Promise<any> {
    const { value } = await Preferences.get({ key: 'autoplayPreferences' });
    if (value !== null) {
      const autoplayPreferencesArray = JSON.parse(value);
      const autoplayPreferences = autoplayPreferencesArray.find(autoplayPreferences => autoplayPreferences.animeId === animeId);
      if (autoplayPreferences !== undefined) {
        return autoplayPreferences;
      } else {
        return null;
      }
    }
  }
}
