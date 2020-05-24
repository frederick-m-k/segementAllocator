
import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Errors } from '../errors';
import { TextGridParser } from './parser/text-grid-parser';

/**
 * Processed for parsing a file into a Map<string, Array<Array<string | number>>> structure
 * with an id
 */
@Component({
  selector: 'app-parse-files',
  templateUrl: './prep-file.component.html',
  styleUrls: ['./prep-file.component.css']
})
export class PrepFileComponent {

  @Input() private type: string;
  @Input() private content: string;
  @Input() private firstLayer: string;
  @Input() private secondLayer: string;

  @Output() errorLogging:EventEmitter<Errors> = new EventEmitter(true);
  @Output() tiers:EventEmitter<Array<string>> = new EventEmitter(true);
  @Output() data:EventEmitter<Map<string, Array<Array<number | string>>>> = new EventEmitter(true);

  private allLayers:Array<string> = new Array();
  dataStructure:Map<string, Array<Array<number | string>>> = new Map();

  private textGridParser = new TextGridParser();

  constructor() { }

  /**
   * check if the Input variables got updated.
   * If they are, parse the file and prepare it for the game
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    let counter = 0;
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) {
          switch (propName) {
            case 'type':
            case 'content':
            case 'firstLayer':
            case 'secondLayer':
              counter++;
              break;
          }
        }
      }
    }

    if (counter == 4) {
      this.parseFile();
    } else {
      counter = 0;
    }
  }

  /**
   * Parse the content of the file in a Map<string, Array<Array<string | number>>>
   */
  private parseFile = () => {
    let parserReturn:Errors;
    if (this.type === "TextGrid") {
      parserReturn = this.textGridParser.parseTextGrid(this.content, this.firstLayer, this.secondLayer);
      switch (parserReturn) {
        case Errors.NO_ERROR:
          this.errorLogging.emit(Errors.NO_ERROR);
          this.data.emit(new Map<string, Array<Array<string | number>>>(this.dataStructure));
          break;
      }
      this.tiers.emit(this.allLayers);
    } else {
      // Write to logfile
      console.log("Maybe you provided a not provided file type " + this.type);
    }
  }

  

}
