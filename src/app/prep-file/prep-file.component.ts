
import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Errors } from '../errors';
import { TextGridParser } from './parser/text-grid-parser';
import { LinkingStandards, LinkingID } from './../standards';
import { Segment } from '../game/Segment';

/**
 * Processed for parsing a file into a Map<string, Array<Array<string | number>>> structure
 * with an id
 */
@Component({
  selector: 'app-prep-file',
  templateUrl: './prep-file.component.html',
  styleUrls: ['./prep-file.component.css']
})
export class PrepFileComponent {

  ////////////////////
  // Input & Output //
  ////////////////////
  @Input() private type: string;
  @Input() private content: string;
  @Input() private firstLayer: string;
  @Input() private secondLayer: string;

  @Output() data: EventEmitter<Map<string, Array<Segment>>> = new EventEmitter(true);
  @Output() segmentLinks: EventEmitter<Map<number, Array<number>>> = new EventEmitter();

  /**
   * This structure holds start and end time, content and own id of segments of two layers
   */
  private dataStructure: Map<string, Array<Segment>> = new Map();
  private links: Map<number, Array<number>> = new Map();
  private allLayers: Array<string> = new Array();
  private counter: number = 0;

  ////////////////////////
  // All custom objects //
  ////////////////////////
  private textGridParser = new TextGridParser();
  private standards = new LinkingStandards();

  constructor() { }

  /**
   * check if the Input variables got updated.
   * If they are, parse the file and prepare it for the game
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) {
          switch (propName) {
            case 'type':
            case 'content':
            case 'firstLayer':
            case 'secondLayer':
              this.counter++;
              break;
          }
        }
      }
    }

    if (this.counter == 4) {
      this.parseFile();
      this.counter = 0;
    }
  }

  /**
   * Parse the content of the file in a Map<string, Array<Segment>>
   */
  private parseFile = () => {
    let parserReturn: Errors;
    if (this.type === "TextGrid") {
      parserReturn = this.textGridParser.parseTextGrid(this.content, this.firstLayer, this.secondLayer);

      switch (parserReturn) {
        case Errors.NO_ERROR:
          this.dataStructure = this.textGridParser.getDataStructure();
          this.addID();
          this.establishLinks();
          this.data.emit(new Map<string, Array<Segment>>(this.dataStructure));
          this.segmentLinks.emit(new Map<number, Array<number>>(this.links));
          break;
      }
    } else {
      if (this.type != null) {
        // Write to logfile
        console.log("Maybe you provided a not provided file type " + this.type);
      }
    }
  }

  /**
   * Find the shortest layer
   */
  private findShortestLayer = (): string => {
    let length: number = Number.MAX_SAFE_INTEGER;
    let layer: string;
    this.dataStructure.forEach((value: Array<Segment>, key: string) => {
      if (value.length < length) {
        length = value.length;
        layer = key;
      }
    });
    return layer;
  }


  ////////////////////
  // Alter the data //
  ////////////////////
  /**
   * Add the own id and a dummy linked-segment id to every segment in the dataStructure
   */
  private addID = () => {
    let id = 0;
    let shortest: string = this.findShortestLayer();
    this.dataStructure.get(shortest).forEach((value: Segment) => {
      value.setID(id);
      this.links.set(id, new Array<number>());
      id++;

      value.setLayerBelonging(shortest, shortest == this.firstLayer);
    });
    let longest: string;
    if (shortest == this.firstLayer) {
      longest = this.secondLayer;
    } else {
      longest = this.firstLayer;
    }
    this.dataStructure.get(longest).forEach((value: Segment) => {
      value.setID(id);
      this.links.set(id, new Array<number>());
      id++;

      value.setLayerBelonging(longest, longest == this.firstLayer);
    });
  }

  /**
   * Establish links of prep file component
   */
  private establishLinks = () => {
    let firstLayer = this.dataStructure.get(this.firstLayer);
    let secondLayer = this.dataStructure.get(this.secondLayer);

    let scopeForLinking: number = this.standards.scopeForSegmentalLinks;

    firstLayer.forEach((segment_first: Segment) => {
      let startPoint_first = <number>segment_first[0];
      let endPoint_first = <number>segment_first[1];
      let ownID_first = <number>segment_first[3];
      let linkedID_first = <number>segment_first[4];

      if (linkedID_first === LinkingID.UNASSIGNED) {
        secondLayer.forEach((segment_second: Segment) => {
          let startPoint_second = <number>segment_second[0];
          let endPoint_second = <number>segment_second[1];
          let ownID_second = <number>segment_second[3];
          let linkedID_second = <number>segment_second[4];

          if (linkedID_second === LinkingID.UNASSIGNED) { // Best case: both UNASSIGNED
            let firstStart_in_second: boolean; // startPoint of first segment between startPoint (minus scope) and endPoint of second segment (minus scope)
            firstStart_in_second = (startPoint_first <= (endPoint_second - scopeForLinking)) &&
              (startPoint_first >= (startPoint_second - scopeForLinking));
            let firstEnd_in_second: boolean; // endPoint of first segment between startPoint (plus scope) and endPoint of second segment  (plus scope)
            firstEnd_in_second = (endPoint_first <= (endPoint_second + scopeForLinking)) &&
              (endPoint_first >= (startPoint_second + scopeForLinking));
            if (firstStart_in_second && firstEnd_in_second) {
              this.links.get(ownID_first).push(ownID_second);
              linkedID_second = LinkingID.ASSIGNED;
              this.links.get(ownID_second).push(ownID_first);
            }
          }
        });
      }
    });
  }

}
