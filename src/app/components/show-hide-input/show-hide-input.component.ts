import { Component, ContentChild, OnInit } from '@angular/core';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-show-hide-input',
  templateUrl: './show-hide-input.component.html',
  styleUrls: ['./show-hide-input.component.scss'],
})
export class ShowHideInputComponent  implements OnInit {

  public showPassword = false;
  @ContentChild(IonInput) input: IonInput;
  constructor() { }

  ngOnInit() {}

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }

}
