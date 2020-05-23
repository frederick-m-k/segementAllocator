import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ba-phonetics';

  constructor() {}

  displayFile = (fileText:string) => {
    let lines = fileText.split('\n');

    for (let i = 0; i < lines.length; i ++) {
      console.log(lines[i]);
    }
  }
}
