
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

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setPixelXStart = (xStart: number): void => { this.pixelXStart = xStart; }
    setPixelXEnd = (xEnd: number): void => { this.pixelXEnd = xEnd; }
    setPixelYStart = (yStart: number): void => { this.pixelYStart = yStart; }
    setPixelYEnd = (yEnd: number): void => { this.pixelYEnd = yEnd; }
    setPixelWidth = (width: number): void => { this.pixelWidth = width; }
    setPixelHeight = (height: number): void => { this.pixelHeight = height; }
    setColor = (color: string): void => { this.color = color; }


    ////////////
    // Getter //
    ////////////
    getXStart = (): number => { return this.xStart; }
    getXEnd = (): number => { return this.xEnd; }
    getContent = (): string => { return this.content; }
    getColor = (): string => { return this.color; }

    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }
    getPixelWidth = (): number => { return this.pixelWidth; }
    getPixelHeight = (): number => { return this.pixelHeight; }
}