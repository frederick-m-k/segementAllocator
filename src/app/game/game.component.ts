
import { Component, Input, SimpleChanges } from '@angular/core';

import { DrawingStandards, DrawingColors, AllocatedColors } from './../standards';
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
  private currentSegment: Segment;
  private segmentSelected: boolean;

  private colors: Map<number, string>;
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
      this.initColors();
      this.drawBoundaries();
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
      this.playGame(x, y);
    });
  }
  /**
   * Initialize the Map holding colors for all allocations
   * based on the layer with less segments
   */
  private initColors = () => {
    let amount: number = this.amountOfShortestLayer();
    let colorCreation: AllocatedColors = new AllocatedColors(amount);
    this.colors = colorCreation.getColors();
  }

  /////////////////////////////////////////
  // Game mechanics for user interaction //
  /////////////////////////////////////////
  /**
   * 
   */
  private playGame = (xPos: number, yPos: number): void => {
    xPos = Math.floor(xPos);
    yPos = Math.floor(yPos);
    let segment_id: number = this.pixelRepresentation[xPos][yPos];
    let segment: Segment = this.findClickedSegment(segment_id);
    if (segment == null) {
      // Error
      return;
    }
    if (this.segmentSelected) { // Compare
      if (this.compareSegments(this.currentSegment, segment)) {
        this.currentSegment.draw(this.areaToDraw);
        this.segmentSelected = false;
        return;
      }
      let differentLayers: boolean = this.compareLayers(this.currentSegment, segment);
      if (differentLayers) {
        let allocationColor: string = this.findAllocationColor(this.currentSegment, segment);
        if (allocationColor == null) {
          // Error
          return;
        }
        this.currentSegment.addAllocation(this.areaToDraw, allocationColor, segment.getID());
        segment.addAllocation(this.areaToDraw, allocationColor, this.currentSegment.getID());
        this.segmentSelected = false;
        return;
      } else {
        this.currentSegment.draw(this.areaToDraw);
      }
    }
    segment.select(this.areaToDraw);
    this.currentSegment = segment;
    this.segmentSelected = true;
  }

  /**
   * Check if segments are the same
   */
  private compareSegments = (oldSegment: Segment, newSegment: Segment): boolean => {
    return oldSegment == newSegment;
  }
  /**
   * Check if the two segments are in different layers
   */
  private compareLayers = (oldSegment: Segment, newSegment: Segment): boolean => {
    let oldInFirst: boolean = this.data.get(this.firstLayer).includes(oldSegment);
    let newInSecond: boolean = this.data.get(this.secondLayer).includes(newSegment);
    return ((oldInFirst && newInSecond) || (!oldInFirst && !newInSecond));
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
   * 
   */
  private findAllocationColor = (oneSegment: Segment, secondSegment: Segment): string => {
    if (this.colors.has(oneSegment.getID())) {
      return this.colors.get(oneSegment.getID());
    } else if (this.colors.has(secondSegment.getID())) {
      return this.colors.get(secondSegment.getID());
    } else {
      // Error, you should not end up here
      console.log("error");
      return null;
    }
  }


  /////////////
  // Drawing //
  /////////////
  /**
   * Draw the segmental boundaries
   */
  private drawBoundaries = (): void => {
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


  /////////////////////////////////
  // Custom pixel representation //
  /////////////////////////////////
  /**
   * Initialize the custom pixel representation with 0s
   */
  private initPixelRep = (): void => {
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
  private fillPixelRep = (segment: Segment): void => {
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

  ////////////////////////////
  // Movement of the canvas //
  ////////////////////////////
  /**
   * Start the movement of the canvas
   */
  private startMoving = (): void => {
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
   * Stop the movement of the canvas
   */
  private stopMoving = (): void => {
    clearInterval(this.interval);
  }
  /**
   * Change the speed of the canvas
   */
  private changeMovingSpeed = (speed: number): void => {
    this.movingSpeed = speed;
    let slidingElement = document.getElementById("movingCanvas");
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
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
   * Return the amount of segments on the shortest layer
   */
  private amountOfShortestLayer = (): number => {
    let amount: number = Number.MAX_SAFE_INTEGER;
    this.data.forEach((value: Array<Segment>) => {
      if (value.length < amount) {
        amount = value.length;
      }
    });
    return amount;
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
  private makeInvisble = (): void => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.add("hiddenGame");
    }
  }
}
