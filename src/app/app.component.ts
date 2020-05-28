
import { Component } from '@angular/core';
import { Errors } from './errors'
import { Segment } from './game/Segment';

/**
 * This component holds the main body
 * It is also responsible for passing information between its childs
 * Lastly it gathers error log messages
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  fileContent: string;
  fileType: string;
  firstLayer: string;
  secondLayer: string;

  tiers: Array<string>;
  errorLogging: Errors;

  data: Map<string, Array<Segment>>;
  links: Map<number, Array<number>>;
  startGame: boolean;

  private errorLog: Array<string> = new Array<string>();
  private nextError: string;

  constructor() { }

  getFile = (fileText: string) => {
    this.fileContent = fileText;
  }
  getFileType = (fileType: string) => {
    this.fileType = fileType;
  }
  getFirstLayer = (firstLayer: string) => {
    this.firstLayer = firstLayer;
  }
  getSecondLayer = (secondLayer: string) => {
    this.secondLayer = secondLayer;
  }

  getError = (errorLogging: Errors) => {
    this.errorLogging = errorLogging;
  }
  getTiers = (tiers: Array<string>) => {
    this.tiers = tiers;
  }

  getData = (data: Map<string, Array<Segment>>) => {
    this.data = data;
    this.startGame = true;
  }
  getLinks = (links: Map<number, Array<number>>) => {
    this.links = links;
  }

  getNextLoggedError = (nextError: string) => {
    this.nextError = nextError;
  }
}
