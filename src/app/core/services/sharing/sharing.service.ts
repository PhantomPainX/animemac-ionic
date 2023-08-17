import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private userExtraSubject = new Subject<boolean>();
  private recentlyLoggedSubject = new Subject<boolean>();
  private seenEpisodeSubject = new Subject<boolean>();
  private themeChangedSubject = new Subject<boolean>();
  private episodeTimeSeenSubject = new Subject<boolean>();
  private autoplayPreferencesSubject = new Subject<any>();

  constructor() { }

  getUserExtra() {
    return this.userExtraSubject;
  }
  emitUserExtraChange(value: boolean) {
    this.userExtraSubject.next(value);
  }

  getRecentlyLogged() {
    return this.recentlyLoggedSubject;
  }
  emitRecentlyLoggedChange(value: boolean) {
    this.recentlyLoggedSubject.next(value);
  }

  getSeenEpisode() {
    return this.seenEpisodeSubject;
  }
  emitSeenEpisodeChange(value: boolean) {
    this.seenEpisodeSubject.next(value);
  }

  getThemeChanged() {
    return this.themeChangedSubject;
  }
  emitThemeChanged(value: boolean) {
    this.themeChangedSubject.next(value);
  }

  getEpisodeTimeSeen() {
    return this.episodeTimeSeenSubject;
  }
  emitEpisodeTimeSeenChanged(value: boolean) {
    this.episodeTimeSeenSubject.next(value);
  }

  getAutoplayPreferences() {
    return this.autoplayPreferencesSubject;
  }
  emitAutoplayPreferencesChanged(value: any) {
    this.autoplayPreferencesSubject.next(value);
  }
}
