
/**
 * Representation of the intro
 */
export class Intro {

    private introDiv: HTMLElement;
    private introText: HTMLElement;
    private startButton: HTMLElement;
    private backButton: HTMLElement;
    private forwardButton: HTMLElement;

    private firstTransition: number;
    private secondTransition: number;

    private currentStage: number;

    private firstStageText: string = "<p>Welcome to " +
        "<span class=\"red\">Segment</span> " +
        "<span class=\"green\">Allocater</span></p>" +
        "<br /><p>Here you have to assign the segments from two layers on each other</p>";

    private secondStageText: string = "<p>Choose segments from " +
        "the layers to establish links between them!<p>" +
        "<br /><p>You can use the mouse or the arrow keys</p>" +
        "<br /><p>Check out the button below to find Shortcuts</p>";

    private thirdStageText: string = "<p>A little tutorial is " +
        "shown now behind this text.</p>" +
        "<br />You can skip it by clicking on the Skip or Forward button <br /> or pressing ENTER</p>"

    private fourthStageText: string = "<p>Ready? Then press ENTER " +
        "or click on the Start Button!</p>" +
        "<br /><p>Enjoy!!</p>";


    constructor() {
        this.introDiv = document.getElementById("intro");
        this.introText = document.getElementById("intro_text");
        this.startButton = document.getElementById("skip_intro");
        this.backButton = document.getElementById("last_intro");
        this.forwardButton = document.getElementById("next_intro");
        if (this.introDiv.classList.contains("hidden")) {
            this.introDiv.classList.remove("hidden");
        }
        this.firstStage();
    }

    /**
     * Show the first stage of the intro
     */
    private firstStage = (): void => {
        this.introDiv.style.opacity = "1";
        this.introText.innerHTML = this.firstStageText;
        this.currentStage = 1;
        this.backButton.classList.add("hidden");
    }
    /**
     * Show the second stage of the intro
     */
    private secondStage = (): void => {
        this.introText.innerHTML = this.secondStageText;
        this.introDiv.style.opacity = "0.9";
        this.currentStage = 2;
        if (this.backButton.classList.contains("hidden")) {
            this.backButton.classList.remove("hidden");
        }
    }
    /**
     * Show the third stage of the intro
     */
    private thirdStage = (): void => {
        this.introText.innerHTML = this.thirdStageText;
        this.startButton.innerText = "Skip";
        this.introDiv.style.opacity = "0.8";
        this.currentStage = 3;
        if (this.forwardButton.classList.contains("hidden")) {
            this.forwardButton.classList.remove("hidden");
        }
    }
    /**
     * Show the fourth stage of the intro
     */
    private fourthStage = (): void => {
        this.introText.innerHTML = this.fourthStageText;
        this.startButton.innerText = "Start";
        this.introDiv.style.opacity = "0.7";
        this.currentStage = 4;
        this.forwardButton.classList.add("hidden");
    }
    /**
     * Skip the intro
     */
    skip = (): void => {
        clearTimeout(this.firstTransition);
        clearTimeout(this.secondTransition);
        this.introText.innerHTML = "";
        this.introDiv.style.opacity = "0";
        this.currentStage = 0;
        setTimeout(() => {
            this.introDiv.classList.add("hidden");
        }, 3000);
    }
    /**
     * Go one stage forward
     */
    nextStage = (): void => {
        switch (this.currentStage) {
            case 1:
                this.secondStage();
                break;
            case 2:
                this.thirdStage();
                break;
            case 3:
                this.fourthStage();
        }
    }
    /**
     * Go one stage backward
     */
    lastStage = (): void => {
        switch (this.currentStage) {
            case 4:
                this.thirdStage();
                break;
            case 3:
                this.secondStage();
            case 2:
                this.firstStage();
                break;
        }
    }
}