
import { Component, Input, SimpleChanges } from '@angular/core';

import { DrawingStandards, DrawingColors } from './../standards';

/**
 * 
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  ////////////////////
  // Input & Output //
  ////////////////////
  @Input() private firstLayer:string;
  @Input() private secondLayer:string; 
  @Input() private data:Map<string, Array<Array<number | string>>>;
  @Input() private links:Map<number, Array<number>>;
  @Input() private startGame:boolean;

  private counter:number = 0;
  private canvas:HTMLCanvasElement;
  private areaToDraw:CanvasRenderingContext2D;

  private standards = new DrawingStandards();

  constructor() { }

  ngOnChanges(changes:SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) { // First change is always on init
          switch (propName) {
            case "firstLayer":
            case "secondLayer":
            case "data":
            case "links":
              this.counter ++;
              break;
          }
        }
      }
    }
    if (this.counter == 4 && this.startGame) {
      this.initCanvas();
      this.drawContent();

      this.makeVisible();
    }
  }

  /**
   * Init the area to draw on
   */
  private initCanvas = () => {
    this.canvas = <HTMLCanvasElement> document.getElementById("gamingAreaCanvas");
    this.areaToDraw = this.canvas.getContext("2d");
  }

  private drawContent = () => {
    let startY:number;
    let startX:number = this.standards.layerMargin;
    this.data.forEach((value: Array<Array<string | number>>, key:string) => {
      switch (key) {
        case this.firstLayer:
          startY = this.standards.firstLayerStart;
          break;
        case this.secondLayer:
          startY = this.standards.secondLayerStart;
          break;
      }
      value.forEach( (segment:Array<string | number>) => {
        let segmentStart = <number> segment[0];
        let segmentEnd = <number> segment[1];
        let content = <string> segment[2];

        // Draw the first boundary ...
        this.areaToDraw.moveTo(startX + segmentStart, startY);
        this.areaToDraw.lineTo(startX + segmentStart, startY + this.standards.segmentHeight);
        this.areaToDraw.stroke();
        // ... and the second one
        this.areaToDraw.moveTo
      });
    });
  }

  /////////////////////////
  // Helpers for drawing //
  /////////////////////////
  private drawSegment = () => {
    
  }

  /////////////////
  // CSS Styling //
  /////////////////
  /**
   * Make gaming are visible
   */
  private makeVisible = () => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i ++) {
      allElements.item(i).classList.remove("hiddenGame");
    }
  }
  /**
   * Make gaming area invisible
   */
  private makeInvisble = () => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i ++) {
      allElements.item(i).classList.add("hiddenGame");
    }
  }
}
