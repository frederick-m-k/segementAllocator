
import { Component, Input, SimpleChanges, HostListener, Output, EventEmitter } from '@angular/core';

import { DrawingStandards, DrawingColors, AllocatedColors } from './../standards';
import { Segment } from './Segment';
import { Intro } from './Intro';
import { ThrowStmt } from '@angular/compiler';

/**
 * For playing the game
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css', '../global/global.css']
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
  private curIntro: boolean;
  private intro: Intro;

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
              if (this.firstLayer != null) {
                this.startCounter++;
              }
              break;
            case "secondLayer":
              if (this.secondLayer != null) {
                this.startCounter++;
              }
              break;
            case "data":
              if (this.data != null) {
                this.startCounter++;
              }
              break;
            case "links":
              if (this.links != null) {
                this.startCounter++;
              }
              break;
          }
        }
      }
    }
    if (this.startCounter == 4 && this.startGame) {
      this.start();
      this.startCounter = 0;
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
    this.startIntro();
    this.startPositionCanvas();
  }

  private init = (): void => {
    this.initCanvas();
    this.initColors();
    this.initPixelRep();
    this.findShortestLayer();
    this.clickEventsForButtonUI();
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
      const rect: DOMRect = this.mainCanvas.getBoundingClientRect();
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
   * Define the start segment as the first segment in the first layer
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
   * Set onclick for the buttons in the button UI
   */
  private clickEventsForButtonUI = (): void => {
    document.getElementById("play_button").onclick = () => {
      if (!this.currentlyMoving) {
        this.move(document.getElementById("movingCanvas"));
      }
    };
    document.getElementById("pause_button").onclick = () => {
      if (this.currentlyMoving) {
        this.stopMoving();
      }
    };
    document.getElementById("fast_forward").onclick = () => {
      this.speedUp();
    };
    document.getElementById("slow_down").onclick = () => {
      this.slowDown();
    };
    document.getElementById("screen_left").onclick = () => {
      this.moveLeft();
    };
    document.getElementById("screen_right").onclick = () => {
      this.moveRight();
    };
    document.getElementById("screen_start").onclick = () => {
      this.startPositionCanvas();
    };

    document.getElementById("move_left").onclick = () => {
      this.leftSegment();
    };
    document.getElementById("move_right").onclick = () => {
      this.rightSegment();
    };
    document.getElementById("move_up").onclick = () => {
      this.upperSegment();
    };
    document.getElementById("move_down").onclick = () => {
      this.lowerSegment();
    };
    document.getElementById("allocate_gathered").onclick = () => {
      this.allocateGathered();
    };
    document.getElementById("reset").onclick = () => {
      this.clearEverything();
    };
  }


  /**
   * Gets called when the button New game gets clicked
   */
  restart = (): void => {
    let allElements = document.getElementsByClassName("gamingArea");
    for (let i = 0; i < allElements.length; i++) {
      allElements.item(i).classList.add("invisible");
    }
    setTimeout(() => {
      this.stopMoving();
      this.makeInvisble();
      this.restartGame.emit(true);
      this.drawingArea.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
      document.getElementById("legend").classList.add("hidden");
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
          this.currentSegments.forEach((value: Segment) => {
            value.draw(this.drawingArea);
            this.currentSegments.delete(value);
          });
          this.segmentSelected = false;
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
          this.removeDuplicatesInShortLayer(segment);
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
   * Add the segment to the right of the current to currentSegments
   */
  private rightSegmentShift = (): void => {
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
  }
  /**
   * Check the segment to the right of the current
   */
  private rightSegment = (): void => {
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
  /**
   * Add the segment to the left of the current to the currentSegments
   */
  private leftSegmentShift = (): void => {
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
  }
  /**
   * Check the segment to the left of the current
   */
  private leftSegment = (): void => {
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
  }
  /**
   * Check the segment to the top of the current segment
   * If the current segment is in the upper layer, reset the current segment
   */
  private upperSegment = (): void => {
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
  }
  /**
   * Check the segment to the bottom of the current segment
   * If the current segment is in the lower layer, reset the current segment
   */
  private lowerSegment = (): void => {
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
        console.log("Couldn't find segment in arrowup");
      }
    } else {
      this.playGame(this.currentSegment);
    }
  }
  /**
   * Allocate all gathered segments and reset the old allocations
   */
  private allocateGathered = (): void => {
    if (this.checkIfAllocatable()) {
      this.removeDuplicatesInShortLayer(this.currentSegment);
      this.clearAllocations();  // Clear old Allocations
      this.addAllocations(); // Add the new Allocations
      this.currentSegments.clear();
      this.segmentSelected = false;
    }
  }

  /////////////////
  // Allocations //
  /////////////////
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
   * Add the correct allocations for all selected segments
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
   * Clear all allocations
   */
  private clearEverything = (): void => {
    this.data.forEach((value: Array<Segment>) => {
      value.forEach((segment: Segment) => {
        segment.reset();
        segment.draw(this.drawingArea);
        segment.clearAllocation();
      });
    });
    this.currentSegments.clear();
    this.segmentSelected = false;
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
    clearInterval(this.interval);
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
  /**
   * Move the canvas to its starting position
   */
  private startPositionCanvas = (): void => {
    document.getElementById("movingCanvas").scrollLeft -= document.getElementById("movingCanvas").scrollLeft;
  }


  ///////////////
  // The Intro //
  ///////////////
  /**
   * Start the intro
   */
  private startIntro = (): void => {
    this.curIntro = true;
    this.intro = new Intro();
  }
  /**
   * Move one screen back in the intro
   */
  introBack = (): void => {
    this.intro.lastStage();
  }
  /**
   * Move one screen forward in the intro
   */
  introForward = (): void => {
    this.intro.nextStage();
  }
  /**
   * Skip the intro
   */
  skipIntro = (): void => {
    this.curIntro = false;
    this.intro.skip();
    setTimeout(() => {
      this.startMoving();
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
   * Check if newly selected segment is in same layer
   */
  private compareLayers = (newSegment: Segment): boolean => {
    return this.currentLayer == newSegment.getLayerBelonging();
  }
  /**
   * If the given segment is in the shortest layer,
   * remove all other segments from this layer which are selected
   */
  private removeDuplicatesInShortLayer = (segment: Segment): void => {
    if (segment.getLayerBelonging() == this.shortestLayer) {
      this.currentSegments.forEach((value: Segment) => {
        if (value !== segment) {
          if (value.getLayerBelonging() == segment.getLayerBelonging()) {
            this.currentSegments.delete(value);
            this.clearSegment(value);
          }
        }
      });
    }
  }
  /**
   * 
   * @param event 
   */
  private checkIfAllocatable = (): boolean => {
    let first: boolean = false, second: boolean = false;
    this.currentSegments.forEach((value: Segment) => {
      if (value.getLayerBelonging() == this.firstLayer) {
        first = true;
      } else if (value.getLayerBelonging() == this.secondLayer) {
        second = true;
      }
    });
    return (first && second);
  }

  ///////////////
  // Shortcuts //
  ///////////////
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {             // for shift and arrow keys
    if (event.key == "Enter" || event.key == "Tab") {
      event.preventDefault();
    }
    if (this.curIntro) {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          this.skipIntro();
          break;
        case "ArrowRight":
          event.preventDefault();
          this.introForward();
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.introBack();
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
        this.moveRight();
      } else if (key == "d") {
        event.preventDefault();
        this.moveLeft();
      } else if (key == "s") {
        this.startPositionCanvas();
      }

      // For segments
      else if (key == "r") {
        this.clearEverything();
      }
      else if (event.shiftKey && key == "ArrowRight") {
        event.preventDefault();
        this.rightSegmentShift();
      } else if (event.shiftKey && key == "ArrowLeft") {
        event.preventDefault();
        this.leftSegmentShift();
      } else if (key == "Enter") {
        event.preventDefault();
        this.allocateGathered();
      } else if (key == "ArrowUp") {
        event.preventDefault()
        this.upperSegment();
      } else if (key == "ArrowDown") {
        event.preventDefault();
        this.lowerSegment();
      } else if (key == "ArrowLeft") {
        event.preventDefault();
        this.leftSegment();
      } else if (key == "ArrowRight") {
        event.preventDefault();
        this.rightSegment();
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
      if (allElements.item(i).classList.contains("invisible")) {
        allElements.item(i).classList.remove("invisible");
      }
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
