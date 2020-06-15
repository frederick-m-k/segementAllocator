import { TextGridParser } from './prep-file/parser/text-grid-parser';

/**
 * Define some standards like the scope on which the program still thinks
 * a segment from one layer could correspond to another one
 */
export class LinkingStandards {
	readonly scopeForSegmentalLinks: number;

	constructor() {
		this.scopeForSegmentalLinks = 0.5;
	}
}

/**
 * Some standards for drawing the game on the canvas
 */
export class DrawingStandards {
	readonly layerSeparator: number;

	///////////////////////////
	// The main canvas sizes //
	///////////////////////////
	readonly mainUpperLayerStart: number = 30;
	readonly mainSegmentHeight: number = 200;
	readonly mainHorizontalScaling: number = 500;

	readonly mainTextFont: string = "20px Palatino";

	readonly mainSelectBaseY: number = 20;
	readonly mainSelectBaseX: number = 20;


	/////////////////////////////
	// The middle canvas sizes //
	/////////////////////////////
	readonly middleUpperLayerStart: number = 100;
	readonly middleSegmentHeight: number = 130;

	readonly middleSelectBaseY: number = 10;
	readonly middleSelectBaseX: number = 10;


	////////////////////////////
	// The small canvas sizes //
	////////////////////////////
	readonly smallUpperLayerStart: number = 170;
	readonly smallSegmentHeight: number = 60;

	readonly smallSelectBaseY: number = 5;
	readonly smallSelectBaseX: number = 5;


	//////////////////
	// Global sizes //
	//////////////////
	private verticalLayerMargin: number = 30;
	readonly textAlign: CanvasTextAlign = "center";
	readonly lineWidth: number = 2;


	constructor() {
		this.layerSeparator = 3;
	}

	/**
	 * Return the complete height of the main canvas
	 */
	mainCanvasHeight = (): number => {
		let returnVal: number =
			this.mainUpperLayerStart +
			this.mainSegmentHeight +
			this.verticalLayerMargin +
			this.mainSegmentHeight +
			this.verticalLayerMargin;
		return returnVal;
	}

	/**
	 * Return the pixel start Y point of the lower layer
	 */
	lowerLayerStart = (): number => {
		let returnVal: number =
			this.mainUpperLayerStart +
			this.mainSegmentHeight +
			this.verticalLayerMargin;
		return returnVal;
	}
}

/**
 * Provide the colors
 */
export class AllocatedColors {

	private allColors: Map<number, string>;

	private red: string = "#9c0a00";
	private green: string = "#009c27";
	private blue: string = "#15009c";

	private max: number = 3;

	constructor(amount: number) {
		this.allColors = new Map();
		for (let i = 0; i < amount; i++) {
			switch (i % this.max) {
				case 0:
					this.allColors.set(i, this.red);
					break;
				case 1:
					this.allColors.set(i, this.green);
					break;
				case 2:
					this.allColors.set(i, this.blue);
					break;
			}
		}
	}

	getColors = () => { return new Map<number, string>(this.allColors); }
}

/**
 * Colors for drawing the game on the canvas
 */
export enum DrawingColors {
	BORDERS = "#3b3c3d",
	LIGHT_BACKGROUND = "#bfbfbf",
	DARK_BACKGROUND = "#e8e8e8",
	TEXT = "#000000",
	CURRENTLY_SELECTED = "#9c0a00",
	BOUNDARY_COLOR = "#000000",
	NO_COLOR = "no_color"
}
/**
 * Providing states for linking the 
 */
export enum LinkingID {
	UNASSIGNED = 0,
	ASSIGNED = 1,
	NOT_ASSIGNABLE = 2
}
