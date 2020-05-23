import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  fileContent:string;
  fileType:string;
  firstLayer: string;
  secondLayer: string;

  constructor() {}

  getFile = (fileText:string) => {
    this.fileContent = fileText;
  }
  getFileType = (fileType: string) => {
    this.fileType = fileType;
  }
  getFirstLayer = (firstLayer:string) => {
    this.firstLayer = firstLayer;
  }
  getSecondLayer = (secondLayer:string) => {
    this.secondLayer = secondLayer;
  }
}
