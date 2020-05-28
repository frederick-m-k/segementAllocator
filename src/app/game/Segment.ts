
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

    private color: string;

    constructor(private xStart: number, private xEnd: number, private content: string) { }

    selectSegment = (canvas: CanvasRenderingContext2D): void => {
        canvas.clearRect(this.pixelXStart, this.pixelYStart, this.pixelWidth, this.pixelHeight);
        canvas.moveTo(this.pixelXStart, this.pixelYStart);
        canvas.lineTo(this.pixelXStart, this.pixelYEnd);
        canvas.moveTo(this.pixelXEnd, this.pixelYStart);
        canvas.lineTo(this.pixelXEnd, this.pixelYEnd);
        canvas.stroke();
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