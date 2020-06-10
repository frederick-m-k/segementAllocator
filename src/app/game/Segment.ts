
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
    private allColors: Map<number, string>;

    //////////////////////
    // Offscreen canvas //
    //////////////////////
    private allDrawings: Map<string, HTMLCanvasElement>;
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
        canvas.drawImage(this.allDrawings.get(this.currentColor), this.pixelXStart, this.pixelYStart);
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
        canvas.drawImage(this.allDrawings.get(this.currentColor), this.pixelXStart, this.pixelYStart);
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
        canvas.drawImage(this.allDrawings.get(this.allocationColor), this.pixelXStart, this.pixelYStart);
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

    private clear = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        let clearXStart: number = ((this.pixelXEnd + this.pixelXStart) / 2) - this.standards.mainSelectBaseX;
        let clearWidth: number = (this.standards.mainSelectBaseX * 2) + (canvas.lineWidth * 2);
        let clearYStart: number;
        let clearHeight: number = this.standards.mainSelectBaseY + (canvas.lineWidth * 2);
        if (this.upperLayer) {
            clearYStart = this.pixelYStart - clearHeight;
        } else {
            clearYStart = this.pixelYEnd;
        }
        canvas.clearRect(clearXStart, clearYStart, clearWidth, clearHeight);
    }

    /**
     * 
     */
    private initOffscreenCanvas = (): void => {
        this.allDrawings = new Map();
        let baseCanvas: HTMLCanvasElement = document.createElement("canvas");
        baseCanvas.height = this.pixelHeight + this.standards.lineWidth;
        baseCanvas.width = this.pixelWidth + this.standards.lineWidth;

        let baseDrawing: CanvasRenderingContext2D = baseCanvas.getContext("2d");
        baseDrawing.lineWidth = this.standards.lineWidth;
        baseDrawing.fillStyle = this.base_color;
        baseDrawing.strokeStyle = DrawingColors.BOUNDARY_COLOR;

        baseDrawing.fillRect(0, 0, this.pixelWidth, this.pixelHeight);

        baseDrawing.beginPath();
        baseDrawing.moveTo(0, 0);
        baseDrawing.lineTo(0, this.pixelHeight);
        baseDrawing.moveTo(this.pixelWidth, 0);
        baseDrawing.lineTo(this.pixelWidth, this.pixelHeight);
        baseDrawing.closePath();
        baseDrawing.stroke();

        baseDrawing.fillStyle = DrawingColors.TEXT;
        baseDrawing.font = this.standards.mainTextFont;
        baseDrawing.textAlign = this.standards.textAlign;
        let textX: number = this.pixelWidth - (this.pixelWidth / 2);
        let textY: number = this.pixelHeight - (this.pixelHeight / 2);
        baseDrawing.fillText(this.content, textX, textY);

        this.allDrawings.set(this.base_color, baseCanvas);

        for (const [, color] of this.allColors) {
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.width = this.pixelWidth + this.standards.lineWidth;
            canvas.height = this.pixelHeight + this.standards.lineWidth;

            let drawing: CanvasRenderingContext2D = canvas.getContext("2d");
            drawing.lineWidth = this.standards.lineWidth;
            drawing.fillStyle = color;
            drawing.strokeStyle = DrawingColors.BOUNDARY_COLOR;

            drawing.fillRect(0, 0, this.pixelWidth, this.pixelHeight);

            drawing.beginPath();
            drawing.moveTo(0, 0);
            drawing.lineTo(0, this.pixelHeight);
            drawing.moveTo(this.pixelWidth, 0);
            drawing.lineTo(this.pixelWidth, this.pixelHeight);
            drawing.closePath();
            drawing.stroke();

            drawing.fillStyle = DrawingColors.TEXT;
            drawing.font = this.standards.mainTextFont;
            drawing.textAlign = this.standards.textAlign;
            let textX: number = this.pixelWidth - (this.pixelWidth / 2);
            let textY: number = this.pixelHeight - (this.pixelHeight / 2);
            drawing.fillText(this.content, textX, textY);

            this.allDrawings.set(color, canvas);
        }

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
        this.allColors = colors;
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