
import { DrawingColors, DrawingStandards } from './../standards';

/**
 * Representation of a Segment with real segment boundaries and pixel-wise boundaries
 */
export class Segment {

    private pixelXStart: number;
    private pixelXEnd: number;
    private pixelYStart: number;
    private pixelYEnd: number;
    private pixelWidth: number;
    private pixelHeight: number;

    private id: number;
    private allocatedIDs: Set<number>;
    private firstLayer: string;

    private base_color: string;
    private allocationColor: string = DrawingColors.NO_COLOR;

    private standards: DrawingStandards;

    constructor(private xStart: number, private xEnd: number, private content: string) {
        this.standards = new DrawingStandards();
        this.pixelXStart = Math.floor(this.xStart * this.standards.scaling);
        this.pixelXEnd = Math.floor(this.xEnd * this.standards.scaling);
        this.pixelWidth = this.pixelXEnd - this.pixelXStart;

        this.allocatedIDs = new Set<number>();
    }

    /**
     * Draw the background of the segment with its content
     */
    draw = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);
        if (this.allocationColor == DrawingColors.NO_COLOR) {
            canvas.fillStyle = this.base_color;
        } else {
            canvas.fillStyle = this.allocationColor;
        }
        this.fill(canvas);
        this.boundaries(canvas);
        this.writeContent(canvas);
    }

    /**
     * Show SELECTED status of segment
     */
    select = (canvas: CanvasRenderingContext2D): void => {
        this.clear(canvas);
        canvas.fillStyle = DrawingColors.CURRENTLY_SELECTED;
        this.fill(canvas);
        this.boundaries(canvas);
        this.writeContent(canvas);
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
        canvas.fillStyle = color;
        this.allocationColor = color;
        this.fill(canvas);
        this.boundaries(canvas);
        this.writeContent(canvas);
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
     * Write the content of this segment on the canvas
     */
    private writeContent = (canvas: CanvasRenderingContext2D): void => {
        let textX: number = this.pixelXStart + ((this.pixelXEnd - this.pixelXStart) / 2);
        let textY: number = this.pixelYStart + ((this.pixelYEnd - this.pixelYStart) / 2);
        canvas.fillStyle = DrawingColors.TEXT;
        canvas.font = this.standards.textFont;
        canvas.textAlign = this.standards.textAlign;
        canvas.fillText(this.content, textX, textY);
    }

    /**
     * Draw the two boundaries of a segment
     */
    private boundaries = (canvas: CanvasRenderingContext2D): void => {
        canvas.strokeStyle = DrawingColors.BOUNDARY_COLOR;
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();
    }

    private fill = (canvas: CanvasRenderingContext2D): void => {
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
    }
    private clear = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
    }

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setPixelYStart = (yStart: number): void => {
        this.pixelYStart = Math.floor(yStart);
        this.pixelYEnd = Math.floor(this.pixelYStart + this.standards.segmentHeight);
        this.pixelHeight = this.pixelYEnd - this.pixelYStart;
    }
    setColor = (color: string): void => { this.base_color = color; }
    setLayerBelonging = (layer: string): void => { this.firstLayer = layer; }
    hasAllocation = (): boolean => { return this.allocatedIDs.size > 0; }

    ////////////
    // Getter //
    ////////////
    getXStart = (): number => { return this.xStart; }
    getXEnd = (): number => { return this.xEnd; }
    getID = (): number => { return this.id; }
    getLayerBelonging = (): string => { return this.firstLayer; }
    getAllocationIDs = (): Set<number> => { return this.allocatedIDs; }

    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }
}