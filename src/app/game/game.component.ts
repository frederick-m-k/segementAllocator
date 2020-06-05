
import { Component, Input, SimpleChanges, HostListener } from '@angular/core';

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
  private drawingArea: CanvasRenderingContext2D;
  /**
   * Double array for every pixel in the canvas holding the id of the segment drawn on it
   */
  private pixelRepresentation: Array<Array<number>>;
  private currentSegment: Segment;
  private segmentSelected: boolean;
  private shortestLayer: string;

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
      this.init();
      this.drawBoundaries();
      this.setStartSegment();
      this.makeVisible();
      this.startMoving();
    }
  }


  //////////////
  // On start //
  //////////////
  private init = () => {
    this.initCanvas();
    this.initColors();
    this.initPixelRep();
    this.findShortestLayer();
  }
  /**
   * Init the area to draw on
   */
  private initCanvas = () => {
    this.canvas = <HTMLCanvasElement>document.getElementById("gamingAreaCanvas");
    let width: number = this.getMaxWidth();
    this.canvas.width = width;
    let height: number = this.standards.canvasHeight();
    this.canvas.height = height;
    this.drawingArea = this.canvas.getContext("2d");
    // Event handling
    this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      this.playGame(this.getSegmentFromMouseEvent(x, y));
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
  /**
   * 
   */
  private setStartSegment = (): void => {
    this.currentSegment = this.data.get(this.firstLayer)[0];
    this.segmentSelected = true;
    this.currentSegment.select(this.drawingArea);
  }

  /////////////////////////////////////////
  // Game mechanics for user interaction //
  /////////////////////////////////////////
  /**
   * Return the segment on which the user clicked
   */
  private getSegmentFromMouseEvent = (xPos: number, yPos: number): Segment => {
    xPos = Math.floor(xPos);
    yPos = Math.floor(yPos);
    let segment_id: number = this.pixelRepresentation[xPos][yPos];
    let segment: Segment = this.findSegment(segment_id);
    return segment;
  }
  /**
   * Compare the provided segment with the currently selected segment and react 
   */
  private playGame = (segment: Segment): void => {
    if (this.segmentSelected) { // Compare
      if (this.compareSegments(this.currentSegment, segment)) {
        this.clearSegment(this.currentSegment);
        this.segmentSelected = false;
        return;
      }
      let differentLayers: boolean = this.compareLayers(this.currentSegment, segment);
      if (differentLayers) {
        this.clearAllocations(this.currentSegment, segment);
        let allocationColor: string = this.findAllocationColor(this.currentSegment, segment);
        if (allocationColor == null) {
          // Error
          console.log("allocation color error");
          return;
        }
        this.currentSegment.addAllocation(this.drawingArea, allocationColor, segment.getID());
        segment.addAllocation(this.drawingArea, allocationColor, this.currentSegment.getID());
        this.segmentSelected = false;
        return;
      } else {
        this.currentSegment.draw(this.drawingArea);
      }
    }
    segment.select(this.drawingArea);
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
    return oldSegment.getLayerBelonging() != newSegment.getLayerBelonging();
  }
  /**
   * Reset a segment when double clicked on it
   */
  private clearSegment = (segment: Segment): void => {
    let seg_id: number = segment.getID();
    let seg_allocations: Set<number> = segment.reset();
    seg_allocations.forEach((id: number) => {
      let allocSeg: Segment = this.findSegment(id);
      allocSeg.removeSpecificAllocation(seg_id);
      allocSeg.draw(this.drawingArea);
    });
    segment.draw(this.drawingArea);
  }
  /**
   * Clear old allocations of the two segments
   */
  private clearAllocations = (oldSegment: Segment, newSegment: Segment) => {
    if (oldSegment.hasAllocation()) {
      if (oldSegment.getLayerBelonging() != this.shortestLayer) { // Also remove the allocation in the segment, oldSegment was linked to
        let otherAllocation: number = oldSegment.clearAllocation();
        let oldLinkedSegment: Segment = this.findSegment(otherAllocation);
        if (oldLinkedSegment.hasAllocation()) {
          oldLinkedSegment.removeSpecificAllocation(oldSegment.getID());
          oldLinkedSegment.draw(this.drawingArea);
        }
      }
    }

    if (newSegment.hasAllocation()) {
      if (newSegment.getLayerBelonging() != this.shortestLayer) { // Also remove the allocation in the segment, newSegment was linked to
        let otherAllocation: number = newSegment.clearAllocation();
        let newLinkedSegment: Segment = this.findSegment(otherAllocation);
        if (newLinkedSegment.hasAllocation()) {
          newLinkedSegment.removeSpecificAllocation(newSegment.getID());
          newLinkedSegment.draw(this.drawingArea);
        }
      }
    }
  }

  /**
   * Get the segment based on its ID
   */
  private findSegment = (id: number): Segment => {
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
   * Return the allocation color of the segment which corresponds to the color
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
        segment.draw(this.drawingArea);
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
    this.move(slidingElement);
  }
  private move = (slidingElement: HTMLElement): void => {
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
  /**
   * 
   */
  private moveRight = (): void => {
    let slidingElement: HTMLElement = document.getElementById("movingCanvas");
    slidingElement.scrollLeft += 50;
  }
  /**
   * 
   */
  private moveLeft = (): void => {
    let slidingElement: HTMLElement = document.getElementById("movingCanvas");
    let temp: number = slidingElement.scrollLeft;
    slidingElement.scrollLeft -= 70;
    if (temp == this.maxScroll) {
      this.move(slidingElement);
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
  private findShortestLayer = (): void => {
    let layer: string;
    let amount: number = Number.MAX_SAFE_INTEGER;
    this.data.forEach((value: Array<Segment>, key: string) => {
      if (value.length < amount) {
        amount = value.length;
        layer = key;
      }
    });
    this.shortestLayer = layer;
  }
  /**
   * Return the segment which is right above or below the middle of the other segment
   */
  private findSegmentInOtherLayer = (segment: Segment): Segment => {
    let middleX: number = Math.floor((segment.getPixelXEnd() + segment.getPixelXStart()) / 2);
    let middleY: number = Math.floor((segment.getPixelYEnd() + segment.getPixelYStart()) / 2);
    if (segment.getLayerBelonging() == this.firstLayer) {
      middleY += this.standards.secondLayerStart();
    } else {
      middleY -= this.standards.secondLayerStart();
    }
    let retSegment: Segment = this.findSegment(this.pixelRepresentation[middleX][middleY]);
    return retSegment;
  }

  ///////////////
  // Shortcuts //
  ///////////////
  @HostListener('body:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {               // for tab, A and D moving
    if (this.startGame) {
      let key: string = event.key;
      //console.log(key);
      switch (key) {
        case "Tab":
          event.preventDefault();
          console.log("Keyup " + key);
          break;
        case "a":
          event.preventDefault();
          this.moveLeft();
          break;
        case "d":
          event.preventDefault();
          this.moveRight();
          break;
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {             // for shift and arrow keys
    if (this.startGame) {
      let key = event.key;
      switch (key) {
        case "Shift":
          console.log("shift");
          break;
        case "ArrowUp":
          event.preventDefault()
          if (this.currentSegment.getLayerBelonging() == this.secondLayer) {
            let segment: Segment = this.findSegmentInOtherLayer(this.currentSegment);
            if (segment != null) {
              this.playGame(segment);
            } else {
              // error
              console.log("Couldn't find segment in arrowup");
            }
          } else {
            this.playGame(this.currentSegment);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (this.currentSegment.getLayerBelonging() == this.firstLayer) {
            let segment: Segment = this.findSegmentInOtherLayer(this.currentSegment);
            if (segment != null) {
              this.playGame(segment);
            } else {
              // error
              console.log("Couldn't find segment in arrowdown");
            }
          } else {
            this.playGame(this.currentSegment);
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (this.data.get(this.currentSegment.getLayerBelonging())[0].getID() != this.currentSegment.getID()) {
            let segment: Segment = this.findSegment(this.currentSegment.getID() - 1);
            this.playGame(segment);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (this.data.get(this.currentSegment.getLayerBelonging())[this.data.get(this.currentSegment.getLayerBelonging()).length - 1].getID() != this.currentSegment.getID()) {
            let segment: Segment = this.findSegment(this.currentSegment.getID() + 1);
            this.playGame(segment);
          }
          break;
      }
    }
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
