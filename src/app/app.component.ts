import { Component } from '@angular/core';
import { Errors } from './errors'

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

  tiers:Array<string>;
  errorLogging:Errors;

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

  getError = (errorLogging:Errors) => {
    this.errorLogging = errorLogging;
  }
  getTiers = (tiers:Array<string>) => {
    this.tiers = tiers;
  }
}
