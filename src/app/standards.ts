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

	///////////////////
	// For selecting //
	///////////////////
	readonly baseY: number;
	readonly baseXOffset: number;

	constructor() {
		this.firstLayerStart = 30;
		this.layerMargin = 30;
		this.layerSeparator = 3;

		this.segmentHeight = 190;

		this.scaling = 500;

		this.textFont = "20px Arial";
		this.textAlign = "center";

		this.baseY = 20;
		this.baseXOffset = 20;
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
		console.log(this.allColors);
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
