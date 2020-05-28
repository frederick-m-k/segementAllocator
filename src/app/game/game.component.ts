
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
  @Input() private firstLayer: string;
  @Input() private secondLayer: string;
  @Input() private data: Map<string, Array<Array<number | string>>>;
  @Input() private links: Map<number, Array<number>>;
  @Input() private startGame: boolean;

  private counter: number = 0;
  private canvas: HTMLCanvasElement;
  private areaToDraw: CanvasRenderingContext2D;

  private standards = new DrawingStandards();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) { // First change is always on init
          switch (propName) {
            case "firstLayer":
            case "secondLayer":
            case "data":
            case "links":
              this.counter++;
              break;
          }
        }
      }
    }
    if (this.counter == 4 && this.startGame) {
      this.initCanvas();
      this.drawContent();
      this.drawText();
      this.makeVisible();
    }
  }

  /**
   * Init the area to draw on
   */
  private initCanvas = () => {
    this.canvas = <HTMLCanvasElement>document.getElementById("gamingAreaCanvas");
    let width: number = this.getWidth();
    this.canvas.width = width;
    let height: number = this.standards.canvasHeight();
    this.canvas.height = height;
    this.areaToDraw = this.canvas.getContext("2d");
  }

  private drawContent = () => {
    let counter: number = 0;
    let startY: number;
    let color: string;
    this.data.forEach((value: Array<Array<string | number>>, key: string) => {
      switch (key) {
        case this.firstLayer:
          startY = this.standards.firstLayerStart;
          break;
        case this.secondLayer:
          startY = this.standards.secondLayerStart();
          break;
      }
      value.forEach((segment: Array<string | number>) => {
        if (counter == 0) {
          color = DrawingColors.DARK_BACKGROUND;
          counter = 1;
        } else {
          color = DrawingColors.LIGHT_BACKGROUND;
          counter = 0;
        }
        let segmentStart = <number>segment[0];
        let segmentEnd = <number>segment[1];
        this.drawSegment(segmentStart, segmentEnd, startY, color);
      });
    });
  }

  /**
   * Draw the content on the canvas
   */
  private drawText = () => {
    let startY: number;
    this.data.forEach((value: Array<Array<string | number>>, key: string) => {
      switch (key) {
        case this.firstLayer:
          startY = this.standards.firstLayerStart;
          break;
        case this.secondLayer:
          startY = this.standards.secondLayerStart();
          break;
      }
      value.forEach((segment: Array<string | number>) => {
        let segmentStart = <number>segment[0];
        let segmentEnd = <number>segment[1];
        let content = <string>segment[2];
        this.text(segmentStart, segmentEnd, content, startY);
      });
    });
  }

  /////////////////////////
  // Helpers for drawing //
  /////////////////////////
  private text = (segmentStart: number, segmentEnd: number, content: string, startY: number) => {
    let startX: number = (segmentStart * this.standards.scaling);
    let endY: number = startY + this.standards.segmentHeight;
    let endX: number = (segmentEnd * this.standards.scaling);
    let textX: number = startX + ((endX - startX) / 2);
    let textY: number = startY + ((endY - startY) / 2);
    this.areaToDraw.fillStyle = DrawingColors.TEXT;
    this.areaToDraw.font = this.standards.text;
    this.areaToDraw.textAlign = "center";
    this.areaToDraw.fillText(content, textX, textY);
  }

  private drawSegment = (segmentStart: number, segmentEnd: number, startY: number, color: string) => {
    let startX: number = (segmentStart * this.standards.scaling);
    let endY: number = startY + this.standards.segmentHeight;
    let endX: number = (segmentEnd * this.standards.scaling);
    // Draw the first boundary ...
    this.areaToDraw.moveTo(startX, startY);
    this.areaToDraw.lineTo(startX, endY);
    this.areaToDraw.stroke();
    // ... and the second one ...
    this.areaToDraw.moveTo(endX, startY);
    this.areaToDraw.lineTo(endX, endY);
    this.areaToDraw.stroke();
    // ... the background
    let rectWidth: number = endX - startX;
    let rectHeight: number = endY - startY;
    this.areaToDraw.fillStyle = color;
    this.areaToDraw.fillRect(startX, startY, rectWidth, rectHeight);
  }

  /**
   * Return the length of the layers, multiplied by 100, in px
   */
  private getWidth = (): number => {
    let start: number = 0, end: number = 0;
    this.data.forEach((value: Array<Array<number | string>>, key: string) => {
      let curStart = <number>value[0][0];
      if (curStart < start) {
        start = curStart;
      }
      let curEnd = <number>value[value.length - 1][1];
      if (curEnd > end) {
        end = curEnd;
      }
    });
    let returnVal = ((end - start) * this.standards.scaling) + 10;
    return returnVal;
  }

  /////////////////
  // CSS Styling //
  /////////////////
  /**
   * Make gaming are visible
   */
  private makeVisible = (): void => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.remove("hiddenGame");
    }
  }
  /**
   * Make gaming area invisible
   */
  private makeInvisble = () => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.add("hiddenGame");
    }
  }
}
