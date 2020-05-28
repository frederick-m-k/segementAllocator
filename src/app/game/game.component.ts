
import { Component, Input, SimpleChanges } from '@angular/core';

import { DrawingStandards, DrawingColors } from './../standards';
import { Segment } from './Segment';

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
  @Input() private data: Map<string, Array<Segment>>;
  @Input() private links: Map<number, Array<number>>;
  @Input() private startGame: boolean;

  private segments: Map<string, Array<Segment>>;
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
      this.drawBoundaries();
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

    // Event handling
    this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      this.logPos(event);
    });
  }
  private logPos = (event: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log(x, y);
  }

  /**
   * Draw the segmental boundaries
   */
  private drawBoundaries = () => {
    let counter: number = 0;
    let startY: number;
    this.data.forEach((value: Array<Segment>, key: string) => {
      switch (key) {
        case this.firstLayer:
          startY = this.standards.firstLayerStart;
          break;
        case this.secondLayer:
          startY = this.standards.secondLayerStart();
          break;
      }
      value.forEach((segment: Segment) => {
        segment.setPixelYStart(startY);
        if (counter == 0) {
          segment.setColor(DrawingColors.DARK_BACKGROUND);
          counter = 1;
        } else {
          segment.setColor(DrawingColors.LIGHT_BACKGROUND);
          counter = 0;
        }
        this.drawSegment(segment);
      });
    });
  }

  /**
   * Draw the segment content on the canvas
   */
  private drawText = () => {
    this.data.forEach((value: Array<Segment>) => {
      value.forEach((segment: Segment) => {
        this.text(segment);
      });
    });
  }

  private playGame = () => {

  }

  /////////////////////////
  // Helpers for drawing //
  /////////////////////////
  private text = (segment: Segment) => {
    let startX: number = segment.getPixelXStart();
    let startY: number = segment.getPixelYStart();
    let endY: number = segment.getPixelYEnd();
    let endX: number = segment.getPixelXEnd();
    let textX: number = startX + ((endX - startX) / 2);
    let textY: number = startY + ((endY - startY) / 2);
    this.areaToDraw.fillStyle = DrawingColors.TEXT;
    this.areaToDraw.font = this.standards.text;
    this.areaToDraw.textAlign = "center";
    this.areaToDraw.fillText(segment.getContent(), textX, textY);
  }

  private drawSegment = (segment: Segment) => {
    let startX: number = (segment.getXStart() * this.standards.scaling);
    segment.setPixelXStart(startX);
    let startY: number = segment.getPixelYStart();
    let endY: number = startY + this.standards.segmentHeight;
    segment.setPixelYEnd(endY);
    let endX: number = (segment.getXEnd() * this.standards.scaling);
    segment.setPixelXEnd(endX);
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
    segment.setPixelWidth(rectWidth);
    let rectHeight: number = endY - startY;
    segment.setPixelHeight(rectHeight);
    this.areaToDraw.fillStyle = segment.getColor();
    this.areaToDraw.fillRect(startX, startY, rectWidth, rectHeight);
  }

  /**
   * Return the length of the layers, multiplied by 100, in px
   */
  private getWidth = (): number => {
    let start: number = 0, end: number = 0;
    this.data.forEach((value: Array<Segment>) => {
      let curStart = value[0].getXStart();
      if (curStart < start) {
        start = curStart;
      }
      let curEnd = value[value.length - 1].getXEnd();
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
