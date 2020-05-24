
import { Component } from '@angular/core';
import { Errors } from './errors'

/**
 * This class is only for passing information between its childs
 */
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

  data:Map<string, Array<Array<string | number>>>;
  startGame:boolean;

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

  getData = (data:Map<string, Array<Array<string | number>>>) => {
    this.data = data;
    this.startGame = true;
  }
}
