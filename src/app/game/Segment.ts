
import { SelectedColorPairs, DrawingColors, DrawingStandards } from './../standards';

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

    private colorCounter: number;
    private base_color: string;

    private standards: DrawingStandards;

    constructor(private xStart: number, private xEnd: number, private content: string) {
        this.colorCounter = 0;
        this.standards = new DrawingStandards();
    }

    /**
     * Draw the background of the segment with its content
     */
    draw = (canvas: CanvasRenderingContext2D): void => {
        this.pixelXStart = Math.floor(this.xStart * this.standards.scaling);
        this.pixelXEnd = Math.floor(this.xEnd * this.standards.scaling);
        this.pixelYEnd = Math.floor(this.pixelYStart + this.standards.segmentHeight);
        this.pixelWidth = this.pixelXEnd - this.pixelXStart;
        this.pixelHeight = this.pixelYEnd - this.pixelYStart;

        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        canvas.strokeStyle = DrawingColors.BOUNDARY_COLOR;
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();

        canvas.fillStyle = this.base_color;
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        this.writeContent(canvas);
    }

    /**
     * Draw the background of the segment with the SELECTED color
     */
    select = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        canvas.fillStyle = DrawingColors.CURRENTLY_SELECTED;
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);

        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();

        this.writeContent(canvas);
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

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setPixelYStart = (yStart: number): void => { this.pixelYStart = Math.floor(yStart); }
    setColor = (color: string): void => { this.base_color = color; }


    ////////////
    // Getter //
    ////////////
    getXStart = (): number => { return this.xStart; }
    getXEnd = (): number => { return this.xEnd; }
    getID = (): number => { return this.id; }

    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }
}