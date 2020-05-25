
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
    let width:string = this.getWidth();
    this.canvas.style.width = width;
    let height:string = this.standards.canvasHeight() + "px";
    this.canvas.style.height = height;
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
        this.drawSegment(segmentStart, segmentEnd, content, startY);
      });
    });
  }

  /////////////////////////
  // Helpers for drawing //
  /////////////////////////
  private drawSegment = (segmentStart:number, segmentEnd:number, content:string, startY:number) => {
    let startX:number = this.standards.layerMargin;;
    // Draw the first boundary ...
    this.areaToDraw.moveTo( (segmentStart * this.standards.scaling) + startX, startY);
    this.areaToDraw.lineTo( (segmentStart * this.standards.scaling) + startX, startY + this.standards.segmentHeight);
    this.areaToDraw.stroke();
    // ... and the second one ...
    this.areaToDraw.moveTo( (segmentEnd * this.standards.scaling) + startX, startY);
    this.areaToDraw.lineTo( (segmentEnd * this.standards.scaling) + startX, startY + this.standards.segmentHeight);
    this.areaToDraw.stroke();
    // ... and the text
  }

  /**
   * Return the length of the layers, multiplied by 100, in px
   */
  private getWidth = ():string => {
    let start:number = 0, end:number = 0;
    this.data.forEach((value: Array<Array<number | string>>, key:string) => {
      let curStart = <number> value[0][0];
      if (curStart < start) {
        start = curStart;
      }
      let curEnd = <number> value[value.length - 1][1];
      if (curEnd > end) {
        end = curEnd;
      }
    });
    let returnVal = ((end - start) * this.standards.scaling) + 100;
    return (returnVal + "px");
  }

  /////////////////
  // CSS Styling //
  /////////////////
  /**
   * Make gaming are visible
   */
  private makeVisible = ():void => {
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
