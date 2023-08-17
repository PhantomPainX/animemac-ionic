import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  // public themeChanged$: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  // public changeTheme(darkTheme: boolean) {
  //   this.themeChanged$.emit(darkTheme);
  // }
}
