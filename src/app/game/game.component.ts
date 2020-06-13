
import { Component, Input, SimpleChanges, HostListener, Output, EventEmitter } from '@angular/core';

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

  @Output() restartGame: EventEmitter<boolean> = new EventEmitter();

  ////////////////
  // For moving //
  ////////////////
  private interval;
  private movingSpeed: number = 200;
  private moveBy: number = 5;
  private maxScroll: number;
  private currentlyMoving: boolean;

  ///////////////////
  // For the intro //
  ///////////////////
  private transitionTimeout;
  private intro: boolean;

  private mainCanvas: HTMLCanvasElement;
  private drawingArea: CanvasRenderingContext2D;
  /**
   * Double array for every pixel in the canvas holding the id of the segment drawn on it
   */
  private pixelRepresentation: Array<Array<number>>;
  private currentSegments: Set<Segment> = new Set();
  private currentSegment: Segment;
  private segmentSelected: boolean;
  private currentLayer: string;

  private shortestLayer: string;

  private colors: Map<number, string>;
  private standards = new DrawingStandards();

  private startCounter: number = 0;

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
              this.startCounter++;
              break;
          }
        }
      }
    }
    if (this.startCounter == 4 && this.startGame) {
      this.start();
    }
  }


  //////////////
  // On start //
  //////////////
  private start = (): void => {
    this.init();
    this.drawBase();
    this.setStartSegment();
    this.makeVisible();
    this.startIntro()
  }

  private init = (): void => {
    this.initCanvas();
    this.initColors();
    this.initPixelRep();
    this.findShortestLayer();
  }
  /**
   * Init the area to draw on
   */
  private initCanvas = () => {
    let width: number = this.getMaxWidth();
    let height: number = this.standards.mainCanvasHeight();

    this.mainCanvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    this.drawingArea = this.mainCanvas.getContext("2d");
    this.mainCanvas.width = width;
    this.mainCanvas.height = height;

    // Event handling only for mainCanvas, cause z-index is highest
    this.mainCanvas.onmousedown = (event: MouseEvent) => {
      const rect = this.mainCanvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      this.playGame(this.getSegmentFromMouseEvent(x, y));
    }
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
    let segment: Segment = this.data.get(this.firstLayer)[0]
    this.currentSegments.add(segment);
    this.segmentSelected = true;
    this.currentSegment = segment;
    segment.select(this.drawingArea);
    this.currentLayer = segment.getLayerBelonging();
  }

  /**
   * 
   */
  restart = (): void => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.add("invisible");
    }
    setTimeout(() => {
      this.makeInvisble();
      this.restartGame.emit(true);
      this.drawingArea.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    }, 3000);
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
    if (segment != null) {
      if (this.segmentSelected) {
        if (this.currentSegments.has(segment)) {
          this.currentSegments.delete(segment);
          this.clearSegment(segment);
          if (this.currentSegments.size == 0) {
            this.segmentSelected = false;
          }
          return;
        } else if (this.compareLayers(segment)) {
          if (segment.getLayerBelonging() == this.shortestLayer) {
            this.currentSegments.delete(this.currentSegment);
            this.clearSegment(this.currentSegment);
            this.currentSegment = segment;
            this.currentSegment.select(this.drawingArea);
            this.currentSegments.add(this.currentSegment);
          } else {
            this.currentSegment = segment;
            segment.select(this.drawingArea);
            this.currentSegments.add(segment);
          }
          return;
        } else {
          this.currentSegments.add(segment);
          this.clearAllocations();  // Clear old Allocations
          this.addAllocations(); // Add the new Allocations
          this.currentSegments.clear();
          this.segmentSelected = false;
          return;
        }
      }
      this.currentSegment = segment;
      segment.select(this.drawingArea);
      this.currentSegments.add(segment);
      this.segmentSelected = true;
      this.currentLayer = segment.getLayerBelonging();
    }
  }

  /**
   * Check if newly selected segment is in same layer
   */
  private compareLayers = (newSegment: Segment): boolean => {
    return this.currentLayer == newSegment.getLayerBelonging();
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
   * Clear old allocations of the selected segments
   */
  private clearAllocations = (): void => {
    this.currentSegments.forEach((segment: Segment) => {
      if (segment.hasAllocation()) {
        if (segment.getLayerBelonging() != this.shortestLayer) {
          let otherAllocation: number = segment.clearAllocation();
          let linkedSegment: Segment = this.findSegment(otherAllocation);
          if (linkedSegment.hasAllocation()) {
            linkedSegment.removeSpecificAllocation(segment.getID());
            linkedSegment.draw(this.drawingArea);
          }
        }
      }
    });
  }
  /**
   * 
   */
  private addAllocations = (): void => {
    let allocationSegment: Segment = this.findAllocationSegment();
    if (allocationSegment == null) {
      console.log("allocation color error");
      return;
    }
    let allocationColor: string = this.colors.get(allocationSegment.getID());
    let idsToAllocate: Set<number> = new Set();
    let tempSet: Set<Segment> = new Set(this.currentSegments);
    tempSet.delete(allocationSegment);
    tempSet.forEach((segment: Segment) => {
      segment.addAllocation(this.drawingArea, allocationColor, allocationSegment.getID());
      idsToAllocate.add(segment.getID());
    });
    idsToAllocate.forEach((id: number) => {
      allocationSegment.addAllocation(this.drawingArea, allocationColor, id);
    });
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
   * Return the segment which holds a allocation color
   */
  private findAllocationSegment = (): Segment => {
    for (const [key] of this.colors) {
      if (this.currentSegments.has(this.findSegment(key))) {
        return this.findSegment(key);
      }
    }
    // Error, you should not end up here
    console.log("error");
    return null;
  }


  /////////////
  // Drawing //
  /////////////
  /**
   * Draw the segmental boundaries
   */
  private drawBase = (): void => {
    let colorCounter: number = 0;
    let startY: number;
    this.data.forEach((value: Array<Segment>, key: string) => {
      switch (key) {
        case this.firstLayer:
          startY = this.standards.mainUpperLayerStart;
          break;
        case this.secondLayer:
          startY = this.standards.lowerLayerStart();
          break;
      }
      value.forEach((segment: Segment) => {
        if (colorCounter == 0) {
          segment.setColor(DrawingColors.DARK_BACKGROUND);
          colorCounter = 1;
        } else {
          segment.setColor(DrawingColors.LIGHT_BACKGROUND);
          colorCounter = 0;
        }
        segment.setPixelYStart(startY, this.colors);
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
    for (let i = 0; i < this.mainCanvas.width; i++) {
      this.pixelRepresentation[i] = new Array();
      for (let j = 0; j < this.mainCanvas.height; j++) {
        this.pixelRepresentation[i][j] = -1;
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
  /**
   * Move the canvas
   */
  private move = (slidingElement: HTMLElement): void => {
    this.interval = setInterval(() => {
      if (slidingElement.scrollLeft == this.maxScroll) {
        this.stopMoving();
      }
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
    this.currentlyMoving = true;
  }
  /**
   * Stop the movement of the canvas
   */
  private stopMoving = (): void => {
    clearInterval(this.interval);
    this.currentlyMoving = false;
  }
  /**
   * Speed up the movement of the canvas
   */
  private speedUp = (): void => {
    this.movingSpeed /= 1.5;
    if (this.movingSpeed <= 40) {
      this.movingSpeed = 40;
    }
    let slidingElement = document.getElementById("movingCanvas");
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
    this.currentlyMoving = true;
  }
  /**
   * Slow down the movement of the canvas
   */
  private slowDown = (): void => {
    this.movingSpeed *= 1.5;
    if (this.movingSpeed >= 1000) {
      this.movingSpeed = 1000;
    }
    let slidingElement = document.getElementById("movingCanvas");
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      slidingElement.scrollLeft += this.moveBy;
    }, this.movingSpeed);
    this.currentlyMoving = true;
  }
  /**
   * Move the canvas a bit to the right
   */
  private moveRight = (): void => {
    let slidingElement: HTMLElement = document.getElementById("movingCanvas");
    slidingElement.scrollLeft += 50;
  }
  /**
   * Move the canvas a bit to the left
   */
  private moveLeft = (): void => {
    let slidingElement: HTMLElement = document.getElementById("movingCanvas");
    slidingElement.scrollLeft -= 70;
  }

  ///////////////
  // The Intro //
  ///////////////
  /**
   * Skip the intro
   */
  skipIntro = (): void => {
    this.intro = false;
    clearTimeout(this.transitionTimeout);
    document.getElementById("intro").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("intro").classList.add("hidden");
      this.startMoving();
    }, 3000);
  }
  /**
   * Start the intro
   */
  private startIntro = (): void => {
    this.intro = true;
    let introDiv: HTMLElement = document.getElementById("intro");
    let introText: HTMLElement = document.getElementById("intro_text");
    let skipButton: HTMLElement = document.getElementById("skip_intro");
    introText.innerHTML = "<p>Welcome to <span style=\"color: #9c0a00\">Segment Allocater</span></p>" +
      "<br /><p>Here you have to assign the segments from two layers on each other</p>";
    this.transitionTimeout = setTimeout(() => {
      introText.innerHTML = "<p>Choose segments from the layers to establish links between them!<p>" +
        "<br /><p>Use the mouse or preferably the arrow keys</p>" +
        "<br /><p>Check out the legend below to find shortcuts</p>";
      introDiv.style.opacity = "0.6";
      setTimeout(() => {
        skipButton.innerHTML = "Start";
        introText.innerHTML = "<p>Ready? Then press Enter or click on the Start Button!</p>" +
          "<br /><p>Enjoy!!</p>";
        introDiv.style.opacity = "0.4";
      }, 9000);
    }, 3000);
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
    let returnVal = ((end - start) * this.standards.mainHorizontalScaling) + 10;
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
  /**
   * Set the global variable shortestLayer to layer with the least segments
   */
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
      middleY += this.standards.lowerLayerStart();
    } else {
      middleY -= this.standards.lowerLayerStart();
    }
    let retSegment: Segment = this.findSegment(this.pixelRepresentation[middleX][middleY]);
    return retSegment;
  }

  ///////////////
  // Shortcuts //
  ///////////////
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {             // for shift and arrow keys
    if (this.intro) {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          this.skipIntro();
          break;
      }
    } else if (this.startGame) {
      let key = event.key;
      // For moving time
      if (key == "Tab") {
        event.preventDefault();
        if (this.currentlyMoving) {
          this.stopMoving();
        } else {
          this.move(document.getElementById("movingCanvas"));
        }
      } else if (key == "+") {
        event.preventDefault();
        this.speedUp();
      } else if (key == "-") {
        event.preventDefault();
        this.slowDown();
      } else if (key == "a") {
        event.preventDefault();
        this.moveLeft();
      } else if (key == "d") {
        event.preventDefault();
        this.moveRight();
      }

      // For segments
      else if (event.shiftKey && key == "ArrowRight") {
        event.preventDefault();
        if (this.data.get(this.currentSegment.getLayerBelonging())[this.data.get(this.currentSegment.getLayerBelonging()).length - 1].getID() != this.currentSegment.getID()) {
          let segment: Segment = this.findSegment(this.currentSegment.getID() + 1);
          if (this.currentSegment.getLayerBelonging() == this.shortestLayer && this.segmentSelected) {
            this.currentSegments.delete(this.currentSegment);
            this.currentSegment.draw(this.drawingArea);
          }
          this.currentSegment = segment;
          segment.select(this.drawingArea);
          this.currentSegments.add(segment);
          this.currentLayer = segment.getLayerBelonging();
          this.segmentSelected = true;
        }
      } else if (event.shiftKey && key == "ArrowLeft") {
        event.preventDefault();
        if (this.data.get(this.currentSegment.getLayerBelonging())[0].getID() != this.currentSegment.getID()) {
          let segment: Segment = this.findSegment(this.currentSegment.getID() - 1);
          if (this.currentSegment.getLayerBelonging() == this.shortestLayer && this.segmentSelected) {
            this.currentSegments.delete(this.currentSegment);
            this.currentSegment.draw(this.drawingArea);
          }
          this.currentSegment = segment;
          segment.select(this.drawingArea);
          this.currentSegments.add(segment);
          this.currentLayer = segment.getLayerBelonging();
          this.segmentSelected = true;
        }
      } else if (key == "Enter") {
        event.preventDefault();
        this.clearAllocations();  // Clear old Allocations
        this.addAllocations(); // Add the new Allocations
        this.currentSegments.clear();
        this.segmentSelected = false;
      } else if (key == "ArrowUp") {
        event.preventDefault()
        if (this.currentSegment.getLayerBelonging() == this.secondLayer) {
          let segment: Segment = this.findSegmentInOtherLayer(this.currentSegment);
          if (segment != null) {
            segment.select(this.drawingArea);
            this.currentSegment = segment;
            this.currentSegments.add(this.currentSegment);
            this.currentLayer = this.currentSegment.getLayerBelonging();
            this.segmentSelected = true;
          } else {
            // error
            console.log("Couldn't find segment in arrowup");
          }
        } else {
          this.playGame(this.currentSegment);
        }
      } else if (key == "ArrowDown") {
        event.preventDefault();
        if (this.currentSegment.getLayerBelonging() == this.firstLayer) {
          let segment: Segment = this.findSegmentInOtherLayer(this.currentSegment);
          if (segment != null) {
            segment.select(this.drawingArea);
            this.currentSegment = segment;
            this.currentSegments.add(this.currentSegment);
            this.currentLayer = this.currentSegment.getLayerBelonging();
            this.segmentSelected = true;
          } else {
            // error
            console.log("Couldn't find segment in arrowdown");
          }
        } else {
          this.playGame(this.currentSegment);
        }
      } else if (key == "ArrowLeft") {
        event.preventDefault();
        if (this.data.get(this.currentSegment.getLayerBelonging())[0].getID() != this.currentSegment.getID()) {
          let segment: Segment = this.findSegment(this.currentSegment.getID() - 1);
          if (this.segmentSelected) {
            this.currentSegments.delete(this.currentSegment);
            this.currentSegment.draw(this.drawingArea);
          }
          this.currentSegment = segment;
          segment.select(this.drawingArea);
          this.currentSegments.add(segment);
          this.currentLayer = segment.getLayerBelonging();
          this.segmentSelected = true;
        }
      } else if (key == "ArrowRight") {
        event.preventDefault();
        if (this.data.get(this.currentSegment.getLayerBelonging())[this.data.get(this.currentSegment.getLayerBelonging()).length - 1].getID() != this.currentSegment.getID()) {
          let segment: Segment = this.findSegment(this.currentSegment.getID() + 1);
          if (this.segmentSelected) {
            this.currentSegments.delete(this.currentSegment);
            this.currentSegment.draw(this.drawingArea);
          }
          this.currentSegment = segment;
          segment.select(this.drawingArea);
          this.currentSegments.add(segment);
          this.currentLayer = segment.getLayerBelonging();
          this.segmentSelected = true;
        }
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
      allElements.item(i).classList.remove("hidden");
    }
  }
  /**
   * Make gaming area invisible
   */
  private makeInvisble = (): void => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.add("hidden");
    }
  }

  ///////////////////
  // Event Binding //
  ///////////////////
  toggleLegend = (): void => {
    let element: HTMLElement = document.getElementById("legend");
    if (element.classList.contains("hidden")) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }
}
