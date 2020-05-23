import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  fileContent:string;
  fileType:string;

  constructor() {}

  getFile = (fileText:string) => {
    this.fileContent = fileText;
  }

  getFileType = (fileType: string) => {
    this.fileType = fileType;
  }
}
