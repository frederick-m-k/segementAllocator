
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

	readonly mainTextFont: string = "20px Arial";

	readonly mainSelectBaseY: number = 20;
	readonly mainSelectBaseX: number = 20;


	/////////////////////////////
	// The middle canvas sizes //
	/////////////////////////////
	readonly middleUpperLayerStart: number = 100;
	readonly middleSegmentHeight: number = 130;

	readonly middleTextFont: string = "15px Arial";

	readonly middleSelectBaseY: number = 10;
	readonly middleSelectBaseX: number = 10;


	////////////////////////////
	// The small canvas sizes //
	////////////////////////////
	readonly smallUpperLayerStart: number = 170;
	readonly smallSegmentHeight: number = 60;

	readonly smallTextFont: string = "10px Arial";

	readonly smallSelectBaseY: number = 5;
	readonly smallSelectBaseX: number = 5;


	//////////////////
	// Global sizes //
	//////////////////
	private verticalLayerMargin: number = 30;
	readonly textAlign: CanvasTextAlign = "center";


	constructor() {
		this.layerSeparator = 3;
	}

	/**
	 * Return the complete height of the canvas
	 */
	canvasHeight = (): number => {
		let returnVal: number =
			this.mainUpperLayerStart +
			this.mainSegmentHeight +
			this.verticalLayerMargin +
			this.mainSegmentHeight +
			this.verticalLayerMargin;
		return returnVal;
	};

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

	constructor(private amount: number) {
		this.allColors = new Map();
		let step: number = Math.floor(255 / amount);
		for (let i = 0; i < amount; i++) {
			let partition: number = step * i;
			this.allColors.set(i, this.rgbColor(partition));
		}
	}

	private rgbColor = (step: number): string => {
		let r: number, g: number, b: number;
		r = g = step;
		b = 255 - step;
		return "rgb(" + r + ", " + g + ", " + b + ")"
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
	TEXT = "#FFFFFF",
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
