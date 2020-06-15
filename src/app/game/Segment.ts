
import { DrawingColors, DrawingStandards } from './../standards';

/**
 * Representation of a Segment with real segment boundaries and pixel-wise boundaries
 */
export class Segment {

    ///////////////////////
    // Sizes for drawing //
    ///////////////////////
    private pixelXStart: number;
    private pixelXEnd: number;
    private pixelYStart: number;
    private pixelYEnd: number;
    private pixelWidth: number;
    private pixelHeight: number;

    ////////////////
    // Allocation //
    ////////////////
    private id: number;
    private allocatedIDs: Set<number>;
    private allocationColor: string = DrawingColors.NO_COLOR;

    private layer: string;
    private upperLayer: boolean;

    private base_color: string;
    private currentColor: string;

    //////////////////////
    // Offscreen canvas //
    //////////////////////
    private selections: Map<string, HTMLCanvasElement>;

    private standards: DrawingStandards;

    constructor(private xStart: number, private xEnd: number, private content: string) {
        this.standards = new DrawingStandards();
        this.pixelXStart = Math.floor(this.xStart * this.standards.mainHorizontalScaling);
        this.pixelXEnd = Math.floor(this.xEnd * this.standards.mainHorizontalScaling);
        this.pixelWidth = this.pixelXEnd - this.pixelXStart;

        this.allocatedIDs = new Set<number>();
    }

    /**
     * Draw the background of the segment with its content
     */
    draw = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);
        if (this.allocationColor == DrawingColors.NO_COLOR) {
            this.currentColor = this.base_color;
        } else {
            this.currentColor = this.allocationColor;
        }
        canvas.fillStyle = this.currentColor;
        this.boundary(canvas);
        this.fill(canvas);
        this.text(canvas);
        //canvas.drawImage(this.allDrawings.get(this.currentColor), this.pixelXStart, this.pixelYStart);
    }

    /**
     * Show SELECTED status of segment
     */
    select = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);
        let startX: number = ((this.pixelXEnd + this.pixelXStart) / 2) - (this.standards.mainSelectBaseX);
        let baseY: number;
        if (this.upperLayer) {
            baseY = this.pixelYStart - this.standards.mainSelectBaseY;
            canvas.drawImage(this.selections.get("upper"), startX, baseY);
        }
        else {
            baseY = this.pixelYEnd;
            canvas.drawImage(this.selections.get("lower"), startX, baseY);
        }
        canvas.fillStyle = this.currentColor;
        this.fill(canvas);
        this.boundary(canvas);
        this.text(canvas);
        //canvas.drawImage(this.allDrawings.get(this.currentColor), this.pixelXStart, this.pixelYStart);
    }

    /**
     * Reset the allocation color and return all allocated IDs
     */
    reset = (): Set<number> => {
        this.allocationColor = DrawingColors.NO_COLOR;
        let temp: Set<number> = new Set<number>(this.allocatedIDs);
        this.allocatedIDs.clear();
        return temp;
    }

    /**
     * Show ALLOCATED status of segment
     */
    private allocate = (canvas: CanvasRenderingContext2D, color: string): void => {
        this.clear(canvas);
        this.allocationColor = color;
        this.currentColor = this.allocationColor;
        canvas.fillStyle = this.currentColor;
        this.boundary(canvas);
        this.fill(canvas);
        this.text(canvas);
        //canvas.drawImage(this.allDrawings.get(this.allocationColor), this.pixelXStart, this.pixelYStart);
    }

    /**
     * Add allocated id of segment and show colors
     */
    addAllocation = (canvas: CanvasRenderingContext2D, color: string, idToAdd: number): void => {
        this.allocate(canvas, color);
        this.allocatedIDs.add(idToAdd);
    }
    /**
     * 
     */
    clearAllocation = (): number => {
        let allocation: number = this.allocatedIDs.values().next().value;
        this.allocatedIDs.clear();
        return allocation;
    }
    /**
     * 
     */
    removeSpecificAllocation = (id: number): void => {
        this.allocatedIDs.delete(id);
        if (this.allocatedIDs.size == 0) {
            this.allocationColor = DrawingColors.NO_COLOR;
        }
    }

    /**
     * Clear the segment with a possible selection arrow on the 2D-Context
     * @param canvas 
     */
    private clear = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        let startX: number = Math.floor((this.pixelXEnd + this.pixelXStart) / 2) - this.standards.mainSelectBaseX - (2 * this.standards.lineWidth);
        let secondX: number = startX + (2 * this.standards.mainSelectBaseX) + (5 * this.standards.lineWidth);
        let endX: number = startX + this.standards.mainSelectBaseX + (2 * this.standards.lineWidth);
        let startY: number;
        let secondY: number;
        let endY: number;
        if (this.upperLayer) {
            startY = this.pixelYStart - this.standards.mainSelectBaseY - (2 * this.standards.lineWidth);
            secondY = startY;
            endY = this.pixelYStart + (2 * this.standards.lineWidth);
        } else {
            startY = this.pixelYEnd + this.standards.mainSelectBaseY + (2 * this.standards.lineWidth);
            secondY = startY;
            endY = this.pixelYEnd - (2 * this.standards.lineWidth);
        }

        canvas.fillStyle = DrawingColors.CLEAR_SELECTED;
        canvas.strokeStyle = DrawingColors.CLEAR_SELECTED;
        canvas.beginPath();
        canvas.moveTo(startX, startY);
        canvas.lineTo(secondX, secondY);
        canvas.lineTo(endX, endY);
        canvas.closePath();
        canvas.stroke();
        canvas.fill();
    }
    /**
     * Fill the segment on the 2D-Context
     * @param canvas 
     */
    private fill = (canvas: CanvasRenderingContext2D): void => {
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
    }
    /**
     * Draw the boundaries of the segment on the 2D-Contect
     * @param canvas 
     */
    private boundary = (canvas: CanvasRenderingContext2D): void => {
        canvas.strokeStyle = DrawingColors.BOUNDARY_COLOR;
        canvas.beginPath();
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.closePath();
        canvas.stroke();
    }
    /**
     * 
     * @param canvas 
     */
    private text = (canvas: CanvasRenderingContext2D): void => {
        canvas.fillStyle = DrawingColors.TEXT;
        canvas.font = this.standards.mainTextFont;
        canvas.textAlign = this.standards.textAlign;
        canvas.lineWidth = this.standards.lineWidth;
        let textX: number = Math.floor(this.pixelXEnd - (this.pixelWidth / 2));
        let textY: number = Math.floor(this.pixelYEnd - (this.pixelHeight / 2));
        canvas.fillText(this.content, textX, textY);
    }

    /**
     * 
     */
    private initOffscreenCanvas = (): void => {
        // Init the two select images
        this.selections = new Map();
        let upperSelect: HTMLCanvasElement = document.createElement("canvas");
        upperSelect.width = Math.floor((this.standards.mainSelectBaseX * 2) + (this.standards.lineWidth * 2));
        upperSelect.height = Math.floor(this.standards.mainSelectBaseY + (this.standards.lineWidth * 2));
        let upperDrawing: CanvasRenderingContext2D = upperSelect.getContext("2d");
        upperDrawing.fillStyle = DrawingColors.CURRENTLY_SELECTED;
        upperDrawing.strokeStyle = DrawingColors.CURRENTLY_SELECTED;
        upperDrawing.lineWidth = this.standards.lineWidth;

        upperDrawing.beginPath();
        upperDrawing.moveTo(0, 0);
        upperDrawing.lineTo(this.standards.mainSelectBaseX * 2, 0);
        upperDrawing.lineTo(this.standards.mainSelectBaseX, this.standards.mainSelectBaseY);
        upperDrawing.closePath();
        upperDrawing.stroke();
        upperDrawing.fill();
        this.selections.set("upper", upperSelect);

        let lowerSelect: HTMLCanvasElement = document.createElement("canvas");
        lowerSelect.width = Math.floor((this.standards.mainSelectBaseX * 2) + (this.standards.lineWidth * 2));
        lowerSelect.height = Math.floor(this.standards.mainSelectBaseY + (this.standards.lineWidth * 2));
        let lowerDrawing: CanvasRenderingContext2D = lowerSelect.getContext("2d");
        lowerDrawing.fillStyle = DrawingColors.CURRENTLY_SELECTED;
        lowerDrawing.strokeStyle = DrawingColors.CURRENTLY_SELECTED;
        lowerDrawing.lineWidth = this.standards.lineWidth;

        lowerDrawing.beginPath();
        lowerDrawing.moveTo(0, this.standards.mainSelectBaseY);
        lowerDrawing.lineTo(this.standards.mainSelectBaseX * 2, this.standards.mainSelectBaseY);
        lowerDrawing.lineTo(this.standards.mainSelectBaseX, 0);
        lowerDrawing.closePath();
        lowerDrawing.stroke();
        lowerDrawing.fill();
        this.selections.set("lower", lowerSelect);
    }

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setPixelYStart = (yStart: number, colors: Map<number, string>): void => {
        this.pixelYStart = Math.floor(yStart);
        this.pixelYEnd = Math.floor(this.pixelYStart + this.standards.mainSegmentHeight);
        this.pixelHeight = this.pixelYEnd - this.pixelYStart;
        this.initOffscreenCanvas();
    }
    setColor = (color: string): void => {
        this.base_color = color;
        this.currentColor = this.base_color;
    }
    setLayerBelonging = (layer: string, upperLayer: boolean): void => {
        this.layer = layer;
        this.upperLayer = upperLayer;
    }

    ////////////
    // Getter //
    ////////////
    getXStart = (): number => { return this.xStart; }
    getXEnd = (): number => { return this.xEnd; }
    getID = (): number => { return this.id; }
    getLayerBelonging = (): string => { return this.layer; }
    getAllocationIDs = (): Set<number> => { return this.allocatedIDs; }
    hasAllocation = (): boolean => { return this.allocatedIDs.size > 0; }

    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }
}