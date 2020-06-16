
import { DrawingColors, DrawingStandards, SelectStatus } from './../standards';

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

    private selectBaseX: number;
    private selectBaseY: number;

    private clearSelectStartX: number;
    private clearSelectStartY: number;
    private clearSelectSecondX: number;
    private clearSelectSecondY: number;
    private clearSelectEndX: number;
    private clearSelectEndY: number;

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

        this.selectBaseX = ((this.pixelXEnd + this.pixelXStart) / 2) - (this.standards.mainSelectBaseX);

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
    }

    /**
     * Show SELECTED status of segment
     */
    select = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);

        if (this.upperLayer) {
            canvas.drawImage(this.selections.get(SelectStatus.UPPER), this.selectBaseX, this.selectBaseY);
        } else {
            canvas.drawImage(this.selections.get(SelectStatus.LOWER), this.selectBaseX, this.selectBaseY);
        }
        canvas.fillStyle = this.currentColor;
        this.fill(canvas);
        this.boundary(canvas);
        this.text(canvas);
    }
    /**
     * Show that the segment is selected, but not the current segment
     */
    oldSelect = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);

        if (this.upperLayer) {
            canvas.drawImage(this.selections.get(SelectStatus.LAST_UPPER), this.selectBaseX, this.selectBaseY);
        } else {
            canvas.drawImage(this.selections.get(SelectStatus.LAST_LOWER), this.selectBaseX, this.selectBaseY);
        }
        canvas.fillStyle = this.currentColor;
        this.fill(canvas);
        this.boundary(canvas);
        this.text(canvas);
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

        this.clearSelect(canvas);
    }
    /**
     * Clear the selection status of a segment
     * @param canvas 
     */
    private clearSelect = (canvas: CanvasRenderingContext2D): void => {
        canvas.fillStyle = DrawingColors.CLEAR_SELECTED;
        canvas.strokeStyle = DrawingColors.CLEAR_SELECTED;
        canvas.beginPath();
        canvas.moveTo(this.clearSelectStartX, this.clearSelectStartY);
        canvas.lineTo(this.clearSelectSecondX, this.clearSelectSecondY);
        canvas.lineTo(this.clearSelectEndX, this.clearSelectEndY);
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
        this.selections.set(SelectStatus.UPPER, upperSelect);

        let upperLastSelect: HTMLCanvasElement = document.createElement("canvas");
        upperLastSelect.width = Math.floor((this.standards.mainSelectBaseX * 2) + (this.standards.lineWidth * 2));
        upperLastSelect.height = Math.floor(this.standards.mainSelectBaseY + (this.standards.lineWidth * 2));
        let upperLastDrawing: CanvasRenderingContext2D = upperLastSelect.getContext("2d");
        upperLastDrawing.fillStyle = DrawingColors.LAST_SELECTED;
        upperLastDrawing.strokeStyle = DrawingColors.LAST_SELECTED;
        upperLastDrawing.lineWidth = this.standards.lineWidth;

        upperLastDrawing.beginPath();
        upperLastDrawing.moveTo(0, 0);
        upperLastDrawing.lineTo(this.standards.mainSelectBaseX * 2, 0);
        upperLastDrawing.lineTo(this.standards.mainSelectBaseX, this.standards.mainSelectBaseY);
        upperLastDrawing.closePath();
        upperLastDrawing.stroke();
        upperLastDrawing.fill();
        this.selections.set(SelectStatus.LAST_UPPER, upperLastSelect);

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
        this.selections.set(SelectStatus.LOWER, lowerSelect);

        let lowerLastSelect: HTMLCanvasElement = document.createElement("canvas");
        lowerLastSelect.width = Math.floor((this.standards.mainSelectBaseX * 2) + (this.standards.lineWidth * 2));
        lowerLastSelect.height = Math.floor(this.standards.mainSelectBaseY + (this.standards.lineWidth * 2));
        let lowerLastDrawing: CanvasRenderingContext2D = lowerLastSelect.getContext("2d");
        lowerLastDrawing.fillStyle = DrawingColors.LAST_SELECTED;
        lowerLastDrawing.strokeStyle = DrawingColors.LAST_SELECTED;
        lowerLastDrawing.lineWidth = this.standards.lineWidth;

        lowerLastDrawing.beginPath();
        lowerLastDrawing.moveTo(0, this.standards.mainSelectBaseY);
        lowerLastDrawing.lineTo(this.standards.mainSelectBaseX * 2, this.standards.mainSelectBaseY);
        lowerLastDrawing.lineTo(this.standards.mainSelectBaseX, 0);
        lowerLastDrawing.closePath();
        lowerLastDrawing.stroke();
        lowerLastDrawing.fill();
        this.selections.set(SelectStatus.LAST_LOWER, lowerLastSelect);
    }

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setPixelYStart = (yStart: number, colors: Map<number, string>): void => {
        this.pixelYStart = Math.floor(yStart);
        this.pixelYEnd = Math.floor(this.pixelYStart + this.standards.mainSegmentHeight);
        this.pixelHeight = this.pixelYEnd - this.pixelYStart;
        if (this.upperLayer) {
            this.selectBaseY = this.pixelYStart - this.standards.mainSelectBaseY;
        }
        else {
            this.selectBaseY = this.pixelYEnd;
        }
        this.initOffscreenCanvas();

        // Initialize values for clearing the select arrow
        this.clearSelectStartX = Math.floor((this.pixelXEnd + this.pixelXStart) / 2) - this.standards.mainSelectBaseX - (2 * this.standards.lineWidth);
        this.clearSelectSecondX = this.clearSelectStartX + (2 * this.standards.mainSelectBaseX) + (5 * this.standards.lineWidth);
        this.clearSelectEndX = this.clearSelectStartX + this.standards.mainSelectBaseX + (2 * this.standards.lineWidth);

        if (this.upperLayer) {
            this.clearSelectStartY = this.pixelYStart - this.standards.mainSelectBaseY - (2 * this.standards.lineWidth);
            this.clearSelectSecondY = this.clearSelectStartY;
            this.clearSelectEndY = this.pixelYStart + this.standards.lineWidth;
        } else {
            this.clearSelectStartY = this.pixelYEnd + this.standards.mainSelectBaseY + (2 * this.standards.lineWidth);
            this.clearSelectSecondY = this.clearSelectStartY;
            this.clearSelectEndY = this.pixelYEnd - this.standards.lineWidth;
        }
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