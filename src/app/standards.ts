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

	readonly textFont: string;
	readonly textAlign: CanvasTextAlign;
	/**
	 * Horzizontal scaling
	 */
	readonly scaling: number;

	constructor() {
		this.firstLayerStart = 20;
		this.layerMargin = 20;
		this.layerSeparator = 3;

		this.segmentHeight = 180;

		this.scaling = 500;

		this.textFont = "20px Arial";
		this.textAlign = "center";
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
	BORDERS = "#3b3c3d",
	LIGHT_BACKGROUND = "#bfbfbf",
	DARK_BACKGROUND = "#666666",
	TEXT = "#FFFFFF",
	CURRENTLY_SELECTED = "#04c707",
	BOUNDARY_COLOR = "#000000"
}

export enum SelectedColorPairs {
	BASE_COLOR_1 = "rgb(0, 0, 255)",
	BASE_COLOR_2 = "rgb(125, 0, 184)"
}

/**
 * Providing states for linking the 
 */
export enum LinkingID {
	UNASSIGNED = 0,
	ASSIGNED = 1,
	NOT_ASSIGNABLE = 2
}
