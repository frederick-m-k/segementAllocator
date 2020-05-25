
/**
 * Define some standards like the scope on which the program still thinks
 * a segment from one layer could correspond to another one
 */
export class LinkingStandards {

    readonly scopeForSegmentalLinks:number;

    constructor () {
        this.scopeForSegmentalLinks = 0.5;
    }
}

/**
 * Some standards for drawing the game on the canvas
 */
export class DrawingStandards {
    
    readonly firstLayerStart:number;
    readonly secondLayerStart:number;
    readonly layerMargin:number;
    readonly layerSeparator:number;

    readonly segmentHeight:number;
    readonly segmentBorderThickness:number;

    constructor () {
        this.firstLayerStart = 10;
        this.secondLayerStart = 60;
        this.layerMargin = 10;
        this.layerSeparator = 3;

        this.segmentHeight = 40;
        this.segmentBorderThickness = 4;
    }
}

/**
 * Colors for drawing the game on the canvas
 */
export enum DrawingColors {
    BORDERS = "#3b3c3d"
}

/**
 * Providing states for linking the 
 */
export enum LinkingID {
    UNASSIGNED = 0,
    ASSIGNED = 1,
    NOT_ASSIGNABLE = 2
}