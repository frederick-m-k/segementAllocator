
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
    private color: string;

    private standards: DrawingStandards;

    constructor(private xStart: number, private xEnd: number, private content: string) {
        this.colorCounter = 0;
        this.standards = new DrawingStandards();
    }

    draw = (canvas: CanvasRenderingContext2D): void => {
        this.pixelXStart = Math.floor(this.xStart * this.standards.scaling);
        this.pixelXEnd = Math.floor(this.xEnd * this.standards.scaling);
        this.pixelYEnd = Math.floor(this.pixelYStart + this.standards.segmentHeight);

        canvas.strokeStyle = DrawingColors.BOUNDARY_COLOR;
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();

        this.pixelWidth = this.pixelXEnd - this.pixelXStart;
        this.pixelHeight = this.pixelYEnd - this.pixelYStart;
        canvas.fillStyle = this.color;
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
    }

    select = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
        canvas.fillStyle = SelectedColorPairs.BASE_COLOR_1;
        canvas.fillRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();
        this.writeContent(canvas);
    }

    writeContent = (canvas: CanvasRenderingContext2D): void => {
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
    setPixelXStart = (xStart: number): void => { this.pixelXStart = Math.floor(xStart); }
    setPixelXEnd = (xEnd: number): void => { this.pixelXEnd = Math.floor(xEnd); }
    setPixelYStart = (yStart: number): void => { this.pixelYStart = Math.floor(yStart); }
    setPixelYEnd = (yEnd: number): void => { this.pixelYEnd = Math.floor(yEnd); }
    setPixelWidth = (width: number): void => { this.pixelWidth = Math.floor(width); }
    setPixelHeight = (height: number): void => { this.pixelHeight = Math.floor(height); }
    setColor = (color: string): void => { this.color = color; }


    ////////////
    // Getter //
    ////////////
    getXStart = (): number => { return this.xStart; }
    getXEnd = (): number => { return this.xEnd; }
    getContent = (): string => { return this.content; }
    getColor = (): string => { return this.color; }
    getID = (): number => { return this.id; }

    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }
    getPixelWidth = (): number => { return this.pixelWidth; }
    getPixelHeight = (): number => { return this.pixelHeight; }
}