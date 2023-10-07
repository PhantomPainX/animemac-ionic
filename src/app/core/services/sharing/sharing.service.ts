import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Themes } from 'src/app/interfaces/themes';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private userExtraSubject = new Subject<boolean>();
  private recentlyLoggedSubject = new Subject<boolean>();
  private seenEpisodeSubject = new Subject<boolean>();
  private themeChangedSubject = new Subject<Themes>();
  private episodeTimeSeenSubject = new Subject<boolean>();
  private autoplayPreferencesSubject = new Subject<any>();
  private videoPlaybackStartedSubject = new Subject<any>();

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
  emitThemeChanged(value: Themes) {
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

  /**
   * Evento para saber si se ha comenzado a reproducir un video
   * para que de este modo se cierre los popover de videos
   */

  getVideoPlaybackStarted() {
    return this.videoPlaybackStartedSubject;
  }
  emitVideoPlaybackStarted(value: any) {
    this.videoPlaybackStartedSubject.next(value);
  }
}
