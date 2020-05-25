
/**
 * Define some standards like the scope on which the program still thinks
 * a segment from one layer could correspond to another one
 */
export class Standards {

    private scopeForSegmentalLinks:number;

    constructor () {
        this.scopeForSegmentalLinks = 0.5;
    }

    scopeForSegmentLinks = () => {
        return this.scopeForSegmentalLinks;
    }
}

/**
 * Providing states for 
 */
export enum LinkingID {
    UNASSIGNED = 0,
    ASSIGNED = 1,
    NOT_ASSIGNABLE = 2
}