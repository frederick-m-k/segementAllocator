
import { Component, Input, SimpleChanges } from '@angular/core';

import { DrawingStandards, DrawingColors } from './../standards';
import { Segment } from './Segment';

/**
 * For playing the game
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

  ////////////////
  // For moving //
  ////////////////
  private interval;
  private movingSpeed: number = 200;
  private moveBy: number = 5;
  private maxScroll: number;

  private counter: number = 0;
  private canvas: HTMLCanvasElement;
  private areaToDraw: CanvasRenderingContext2D;
  /**
   * Double array for every pixel in the canvas holding the id of the segment drawn on it
   */
  private pixelRepresentation: Array<Array<number>>;

  private standards = new DrawingStandards();

  constructor() { }

  /**
   * check if Input variables changed
   * @param changes 
   */
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
      this.startMoving();
    }
  }


  //////////////
  // On start //
  //////////////
  /**
   * Init the area to draw on
   */
  private initCanvas = () => {
    this.canvas = <HTMLCanvasElement>document.getElementById("gamingAreaCanvas");
    let width: number = this.getMaxWidth();
    this.canvas.width = width;
    let height: number = this.standards.canvasHeight();
    this.canvas.height = height;
    this.areaToDraw = this.canvas.getContext("2d");

    this.initPixelRep();

    // Event handling
    this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      this.logPos(x, y);
    });
  }


  private logPos = (xPos: number, yPos: number) => {
    xPos = Math.floor(xPos);
    yPos = Math.floor(yPos);
    let segment_id: number = this.pixelRepresentation[xPos][yPos];
    let segment: Segment = this.findClickedSegment(segment_id);
    if (segment != null) {
      segment.select(this.areaToDraw);
    }
  }


  /////////////
  // Drawing //
  /////////////
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
        segment.draw(this.areaToDraw);
        this.fillPixelRep(segment);
      });
    });
  }

  /**
   * Draw the segment content on the canvas
   */
  private drawText = () => {
    this.data.forEach((value: Array<Segment>) => {
      value.forEach((segment: Segment) => {
        segment.writeContent(this.areaToDraw);
      });
    });
  }


  /////////////////////////////////
  // Custom pixel representation //
  /////////////////////////////////
  /**
   * Initialize the custom pixel representation with 0s
   */
  private initPixelRep = () => {
    this.pixelRepresentation = new Array();
    for (let i = 0; i < this.canvas.width; i++) {
      this.pixelRepresentation[i] = new Array();
      for (let j = 0; j < this.canvas.height; j++) {
        this.pixelRepresentation[i][j] = 0;
      }
    }
  }
  /**
   * Update the pixels at the position of the given segment
   */
  private fillPixelRep = (segment: Segment) => {
    let startX: number = segment.getPixelXStart();
    let endX: number = segment.getPixelXEnd();
    let startY: number = segment.getPixelYStart();
    let endY: number = segment.getPixelYEnd();

    let segment_id: number = segment.getID();
    for (let i = startX; i < endX; i++) {
      for (let j = startY; j < endY; j++) {
        this.pixelRepresentation[i][j] = segment_id;
      }
    }
  }


  /////////////
  // Helpers //
  /////////////
  /**
   * Return the maximal length of the layers, multiplied by 100, in px
   */
  private getMaxWidth = (): number => {
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
  /**
   * Get the segment based on its ID
   */
  private findClickedSegment = (id: number): Segment => {
    for (const [key, value] of this.data) {
      for (let i = 0; i < value.length; i++) {
        let segment: Segment = value[i];
        if (segment.getID() == id) {
          return segment;
        }
      }
    }
    return null;
  }
  /**
   * Start the movement of the canvas
   */
  private startMoving = () => {
    let slidingElement = document.getElementById("movingCanvas");
    this.maxScroll = slidingElement.scrollWidth - slidingElement.clientWidth;
    this.interval = setInterval(() => {
      if (slidingElement.scrollLeft == this.maxScroll) {
        this.stopMoving();
      }
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
  }
  /**
   * 
   */
  private stopMoving = () => {
    clearInterval(this.interval);
  }
  /**
   * 
   */
  private changeMovingSpeed = (speed: number) => {
    this.movingSpeed = speed;
    let slidingElement = document.getElementById("movingCanvas");
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
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
