
import { DrawingColors, DrawingStandards, CanvasLayer, SelectPosition } from './../standards';

/**
 * Representation of a Segment with real segment boundaries and pixel-wise boundaries
 */
export class Segment {

    ////////////////////////////
    // Sizes for main drawing //
    ////////////////////////////
    private pixelYStart: number;
    private pixelYEnd: number;
    private pixelHeight: number;
    private pixelXStart: number;
    private pixelXEnd: number;
    private pixelWidth: number;

    //////////////////////////////
    // Sizes for middle drawing //
    //////////////////////////////
    private middlePixelYStart: number;
    private middlePixelYEnd: number;
    private middlePixelHeight: number;
    private middlePixelXStart: number;
    private middlePixelXEnd: number;
    private middlePixelWidth: number;

    /////////////////////////////
    // Sizes for small drawing //
    /////////////////////////////
    private smallPixelYStart: number;
    private smallPixelYEnd: number;
    private smallPixelHeight: number;
    private smallPixelXStart: number;
    private smallPixelXEnd: number;
    private smallPixelWidth: number;

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
    private allDrawings: Map<number, Map<string, HTMLCanvasElement>>;
    private selections: Map<number, HTMLCanvasElement>;

    private standards: DrawingStandards;

    constructor(private xStart: number, private xEnd: number, private content: string) {
        this.standards = new DrawingStandards();
        // Main drawing
        this.pixelXStart = Math.floor(this.xStart * this.standards.mainHorizontalScaling);
        this.pixelXEnd = Math.floor(this.xEnd * this.standards.mainHorizontalScaling);
        this.pixelWidth = this.pixelXEnd - this.pixelXStart;
        // Middle drawing
        this.middlePixelXStart = Math.floor(this.xStart * this.standards.middleHorizontalScaling);
        this.middlePixelXEnd = Math.floor(this.xEnd * this.standards.middleHorizontalScaling);
        this.middlePixelWidth = this.middlePixelXEnd - this.middlePixelXStart;
        // Small drawing
        this.smallPixelXStart = Math.floor(this.xStart * this.standards.smallHorizontalScaling);
        this.smallPixelXEnd = Math.floor(this.xEnd * this.standards.smallHorizontalScaling);
        this.smallPixelWidth = this.smallPixelXEnd - this.smallPixelXStart;

        this.allocatedIDs = new Set<number>();
    }

    /**
     * Draw the background of the segment with its content
     */
    draw = (canvas: CanvasRenderingContext2D, layer: CanvasLayer = CanvasLayer.SMALL): void => {
        this.clear(canvas);
        if (this.allocationColor == DrawingColors.NO_COLOR) {
            this.currentColor = this.base_color;
        } else {
            this.currentColor = this.allocationColor;
        }
        let xPos: number, yPos: number;
        switch (layer) {
            case CanvasLayer.SMALL:
                xPos = this.smallPixelXStart;
                yPos = this.smallPixelYStart;
                break;
            case CanvasLayer.MIDDLE:
                xPos = this.middlePixelXStart;
                yPos = this.middlePixelYStart;
                break;
            case CanvasLayer.MAIN:
                xPos = this.pixelXStart;
                yPos = this.pixelYStart;
                break;
        }
        canvas.drawImage(this.allDrawings.get(layer).get(this.currentColor), xPos, yPos);
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
            canvas.drawImage(this.selections.get(SelectPosition.UPPER), startX, baseY);
        }
        else {
            baseY = this.pixelYEnd;
            canvas.drawImage(this.selections.get(SelectPosition.LOWER), startX, baseY);
        }
        canvas.drawImage(this.allDrawings.get(CanvasLayer.MAIN).get(this.currentColor), this.pixelXStart, this.pixelYStart);
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
        canvas.drawImage(this.allDrawings.get(CanvasLayer.MAIN).get(this.allocationColor), this.pixelXStart, this.pixelYStart);
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
     * Initialize all drawings on offscreen canvas
     */
    private initDrawings = (): void => {
        this.allDrawings = new Map();
        this.allDrawings.set(CanvasLayer.MAIN, new Map<string, HTMLCanvasElement>());
        this.allDrawings.set(CanvasLayer.MIDDLE, new Map<string, HTMLCanvasElement>());
        this.allDrawings.set(CanvasLayer.SMALL, new Map<string, HTMLCanvasElement>());
        this.allDrawings.forEach((value: Map<string, HTMLCanvasElement>, key: number) => {
            let curYStart: number, curYEnd: number, curHeight: number;
            let curXStart: number, curXEnd: number, curWidth: number;
            let textFont: string;

            let baseCanvas: HTMLCanvasElement = document.createElement("canvas");
            switch (key) {
                case CanvasLayer.MAIN:
                    if (this.upperLayer) {
                        this.pixelYStart = this.standards.mainUpperLayerStart;
                        curYStart = this.pixelYStart;
                    } else {
                        this.pixelYStart = this.standards.lowerLayerStart();
                        curYStart = this.pixelYStart;
                    }
                    this.pixelYEnd = this.pixelYStart + this.standards.mainSegmentHeight;
                    curYEnd = this.pixelYEnd;
                    this.pixelHeight = this.standards.mainSegmentHeight;
                    curHeight = this.pixelHeight;

                    curXStart = this.pixelXStart;
                    curXEnd = this.pixelXEnd;
                    curWidth = this.pixelWidth;

                    textFont = this.standards.mainTextFont;
                    break;
                case CanvasLayer.MIDDLE:
                    if (this.upperLayer) {
                        this.middlePixelYStart = this.standards.middleUpperLayerStart;
                        curYStart = this.middlePixelYStart;
                    } else {
                        this.middlePixelYStart = this.standards.lowerLayerStart();
                        curYStart = this.middlePixelYStart;
                    }
                    this.middlePixelYEnd = this.middlePixelYStart + this.standards.middleSegmentHeight;
                    curYEnd = this.middlePixelYEnd;
                    this.middlePixelHeight = this.standards.middleSegmentHeight;
                    curHeight = this.middlePixelHeight;

                    curXStart = this.middlePixelXStart;
                    curXEnd = this.middlePixelXEnd;
                    curWidth = this.middlePixelWidth;

                    textFont = this.standards.middleTextFont;
                    break;
                case CanvasLayer.SMALL:
                    if (this.upperLayer) {
                        this.smallPixelYStart = this.standards.smallUpperLayerStart;
                        curYStart = this.smallPixelYStart;
                    } else {
                        this.smallPixelYStart = this.standards.lowerLayerStart();
                        curYStart = this.smallPixelYStart;
                    }
                    this.smallPixelYEnd = this.smallPixelYStart + this.standards.smallSegmentHeight;
                    curYEnd = this.smallPixelYEnd;
                    this.smallPixelHeight = this.standards.smallSegmentHeight;
                    curHeight = this.smallPixelHeight;

                    curXStart = this.smallPixelXStart;
                    curXEnd = this.smallPixelXEnd;
                    curWidth = this.smallPixelWidth;

                    textFont = this.standards.smallTextFont;
                    break;
            }
            baseCanvas.height = curHeight + this.standards.lineWidth;
            baseCanvas.width = curWidth + this.standards.lineWidth;

            let baseDrawing: CanvasRenderingContext2D = baseCanvas.getContext("2d");
            baseDrawing.lineWidth = this.standards.lineWidth;
            baseDrawing.fillStyle = this.base_color;
            baseDrawing.strokeStyle = DrawingColors.BOUNDARY_COLOR;

            baseDrawing.fillRect(0, 0, curWidth, curHeight);

            baseDrawing.beginPath();
            baseDrawing.moveTo(0, 0);
            baseDrawing.lineTo(0, curHeight);
            baseDrawing.moveTo(curWidth, 0);
            baseDrawing.lineTo(curWidth, curHeight);
            baseDrawing.closePath();
            baseDrawing.stroke();

            baseDrawing.fillStyle = DrawingColors.TEXT;
            baseDrawing.font = textFont;
            baseDrawing.textAlign = this.standards.textAlign;
            let textX: number = curWidth - (curWidth / 2);
            let textY: number = curHeight - (curHeight / 2);
            baseDrawing.fillText(this.content, textX, textY);

            value.set(this.base_color, baseCanvas);

            for (const [, color] of this.allColors) {
                let canvas: HTMLCanvasElement = document.createElement("canvas");
                canvas.width = curWidth + this.standards.lineWidth;
                canvas.height = curHeight + this.standards.lineWidth;

                let drawing: CanvasRenderingContext2D = canvas.getContext("2d");
                drawing.lineWidth = this.standards.lineWidth;
                drawing.fillStyle = color;
                drawing.strokeStyle = DrawingColors.BOUNDARY_COLOR;

                drawing.fillRect(0, 0, curWidth, curHeight);

                drawing.beginPath();
                drawing.moveTo(0, 0);
                drawing.lineTo(0, curHeight);
                drawing.moveTo(curWidth, 0);
                drawing.lineTo(curWidth, curHeight);
                drawing.closePath();
                drawing.stroke();

                drawing.fillStyle = DrawingColors.TEXT;
                drawing.font = textFont;
                drawing.textAlign = this.standards.textAlign;
                let textX: number = curWidth - (curWidth / 2);
                let textY: number = curHeight - (curHeight / 2);
                drawing.fillText(this.content, textX, textY);

                value.set(color, canvas);
            }
        });


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
        this.selections.set(SelectPosition.UPPER, upperSelect);

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
        this.selections.set(SelectPosition.LOWER, lowerSelect);
    }

    ////////////
    // Setter //
    ////////////
    setID = (id: number): void => { this.id = id; }
    setColor = (color: string, colors: Map<number, string>): void => {
        this.base_color = color;
        this.currentColor = this.base_color;

        this.allColors = colors;
        this.initDrawings();
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

    ////////////////
    // Main sizes //
    getPixelXStart = (): number => { return this.pixelXStart; }
    getPixelXEnd = (): number => { return this.pixelXEnd; }
    getPixelYStart = (): number => { return this.pixelYStart; }
    getPixelYEnd = (): number => { return this.pixelYEnd; }

    //////////////////
    // Middle sizes //
    getMiddlePixelXStart = (): number => { return this.middlePixelXStart; }
    getMiddlePixelXEnd = (): number => { return this.middlePixelXEnd; }
    getMiddlePixelYStart = (): number => { return this.middlePixelYStart; }
    getMiddlePixelYEnd = (): number => { return this.middlePixelYEnd; }

    /////////////////
    // Small sizes //
    getSmallPixelXStart = (): number => { return this.smallPixelXStart; }
    getSmallPixelXEnd = (): number => { return this.smallPixelXEnd; }
    getSmallPixelYStart = (): number => { return this.smallPixelYStart; }
    getSmallPixelYEnd = (): number => { return this.smallPixelYEnd; }
}