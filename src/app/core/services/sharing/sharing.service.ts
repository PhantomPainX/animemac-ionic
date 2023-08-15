import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharingService {

  private userExtraSubject = new Subject<boolean>();
  constructor() { }

  getUserExtra() {
    return this.userExtraSubject;
  }
  emitUserExtra(value: boolean) {
    this.userExtraSubject.next(value);
  }
}
