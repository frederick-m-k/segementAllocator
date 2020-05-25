
import { Errors } from './../../errors';

/**
 * Parses a TextGrid file
 * TODOs
 *  - test Point tiers
 */
export class TextGridParser {

    private allTiers:Array<string> = new Array<string>();
    private dataStructure:Map<string, Array<Array<string | number>>> = new Map();

    /**
     * Iterate over each line of a TextGrid file
     * and save the correct information about the segment boundaries in the dataStructure
     */
    parseTextGrid = (content:string, firstLayer:string, secondLayer:string) => {
        let foundFirst:boolean;
        let foundSecond:boolean;
        let amountOfTiers:number;
        let pointTier:boolean = null;
        let watchForNextSegment:boolean = false;

        let lines = content.split('\n');

        if (lines[0].includes("ooTextFile")) {
            for (let first = 1; first < lines.length; first ++) {
                // First there is some metadata ...
                if ( lines[first].startsWith("size =")) {
                    amountOfTiers = parseInt( lines[first].split("=")[1].toString().trim() );
                    if (isNaN(amountOfTiers) || amountOfTiers == null) {
                        amountOfTiers = 0;
                    }
                }
                // ...then the actual data comes through
                if ( lines[first].includes("item []:") ) {
                    let startPoint:number;
                    let endPoint:number;
                    let label:string;
                    for (let tier = 1; tier <= amountOfTiers; tier ++) { // search for tier data as often as amountOfTiers
                        let layerOnThisRun:number = 0;
                        let borderInformation:number = 0;
                        if (lines[first + 1].includes("item [" + tier + "]:")) {
                            for (let second = first + 2; second < lines.length; second ++) {
                                let currentLine = lines[second];
                                // Read some metadata first ...
                                if (currentLine.includes("class = ") && !watchForNextSegment) { // Just to make sure, the metadata is not written in the labels
                                    // Only works for Interval tiers so far
                                    if (currentLine.includes("IntervalTier")) {
                                        pointTier = false;
                                    } else if (currentLine.includes("TextTier")) {
                                        pointTier = true;
                                    }
                                } else if (currentLine.includes("name = ") && !watchForNextSegment) { // Check if the tier is relevant
                                    this.allTiers.push(currentLine.split("=")[1].toString().trim());
                                    if (currentLine.includes(firstLayer)) {
                                        this.dataStructure.set(firstLayer, new Array());
                                        foundFirst = true;
                                        layerOnThisRun = 1;
                                    } else if (currentLine.includes(secondLayer)) {
                                        this.dataStructure.set(secondLayer, new Array());
                                        foundSecond = true;
                                        layerOnThisRun = 2;
                                    }
                                } else if ( (currentLine.includes("intervals [") || currentLine.includes("points [")) && !watchForNextSegment) { // Start searching for the actual data
                                    watchForNextSegment = true;
                                    borderInformation = 0;
                                } else if (currentLine.includes("item [") && !watchForNextSegment) {  // Cycle is done
                                    first = second - 1;
                                    break;
                                }
                                // ...and the the actual data
                                if (watchForNextSegment) {
                                    if (!pointTier) {
                                        if (currentLine.includes("xmin =")) {
                                            startPoint = parseFloat(currentLine.split("=")[1].toString().trim());
                                            borderInformation++;
                                            if (isNaN(startPoint) || startPoint == null) { // Reset
                                                watchForNextSegment = false;
                                                borderInformation = 0;
                                                // Write to logfile
                                                console.log("parseFloat didn't work");
                                                console.log(startPoint);
                                            }
                                        } else if (currentLine.includes("xmax =")) {
                                            endPoint = parseFloat(currentLine.split("=")[1].toString().trim());
                                            borderInformation++;
                                            if (isNaN(endPoint) || endPoint == null) {  // Reset
                                                watchForNextSegment = false;
                                                borderInformation = 0;
                                                // Write to logfile
                                                console.log("parseFloat didn't work");
                                                console.log(endPoint);
                                            }
                                        } else if (currentLine.includes("text =")) {
                                            label = currentLine.split("=")[1].toString();
                                            borderInformation++;
                                            if (label == null) {  // Reset
                                                watchForNextSegment = false;
                                                borderInformation = 0;
                                                // Write to logfile
                                                console.log(currentLine + " should contain the label");
                                                console.log(label);
                                            }
                                        }
                                    } else {
                                        if (currentLine.includes("number =")) {
                                            startPoint = parseFloat(currentLine.split("=")[1].toString().toString().trim());
                                            endPoint = parseFloat(currentLine.split("=")[1].toString().trim());
                                            borderInformation += 2;
                                            if ( isNaN(startPoint) || startPoint == null || isNaN(endPoint) || startPoint == null) {
                                                watchForNextSegment = false;
                                                borderInformation = 0;
                                                // Write to logfile
                                                console.log("parseFloat didn't work");
                                                console.log(startPoint);
                                                console.log(startPoint);
                                            }
                                        } else if (currentLine.includes("mark =")) {
                                            label = currentLine.split("=")[1].toString().trim();
                                            borderInformation ++;
                                            if (label == null) {
                                                watchForNextSegment = false;
                                                borderInformation = 0;
                                                // Write to logfile
                                                console.log(currentLine + " should contain the label");
                                                console.log(label);
                                            }
                                        }
                                    }
                                    if (borderInformation == 3) {
                                        watchForNextSegment = false;
                                        if (layerOnThisRun === 1) {
                                            this.dataStructure.get(firstLayer).push([startPoint, endPoint, label]);
                                        } else if (layerOnThisRun === 2) {
                                            this.dataStructure.get(secondLayer).push([startPoint, endPoint, label]);
                                        }
                                    }
                                }
                            }
                        } else {
                        console.log("Something went wrong!")
                        console.log(lines[first + 1] + " should be item [" + tier + "]:");
                        }
                    }
                    break;
                }
            }
        }
        if (!foundFirst || !foundSecond) {
            return(Errors.TIER_ERROR);
        } else {
            return(Errors.NO_ERROR);
        }
    }

    getAllTiers = () => { return this.allTiers; }
    getDataStructure = () => { return new Map<string, Array<Array<string | number>>>(this.dataStructure); }
}