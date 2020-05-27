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
	readonly firstLayerStart: number;
	private layerMargin: number;
	readonly layerSeparator: number;

	readonly segmentHeight: number;
	readonly segmentBorderThickness: number;

	readonly scaling: number;

	constructor() {
		this.firstLayerStart = 10;
		this.layerMargin = 10;
		this.layerSeparator = 3;

		this.segmentHeight = 80;
		this.segmentBorderThickness = 4;

		this.scaling = 100;
	}

	canvasHeight = (): number => {
		let returnVal: number =
			this.firstLayerStart +
			this.segmentHeight +
			this.layerMargin +
			this.segmentHeight +
			this.layerMargin;
		return returnVal;
	};

	secondLayerStart = (): number => {
		let returnVal: number =
			this.firstLayerStart +
			this.segmentHeight +
			this.layerMargin;
		return returnVal;
	}
}

/**
 * Colors for drawing the game on the canvas
 */
export enum DrawingColors {
	BORDERS = '#3b3c3d',
	RED_BACKGROUND = "#ff6666",
	BLUE_BACKGROUND = "#6699ff"
}

/**
 * Providing states for linking the 
 */
export enum LinkingID {
	UNASSIGNED = 0,
	ASSIGNED = 1,
	NOT_ASSIGNABLE = 2
}
