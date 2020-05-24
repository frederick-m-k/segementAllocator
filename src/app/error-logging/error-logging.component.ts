
import { Component, Input, SimpleChanges } from '@angular/core';
import { Errors, ErrorMessages } from './../errors'

/**
 * Component
 */
@Component({
  selector: 'app-error-logging',
  templateUrl: './error-logging.component.html',
  styleUrls: ['./error-logging.component.css']
})
export class ErrorLoggingComponent {

  @Input() private errorLogging:Errors;
  @Input() private tiers:Array<string>;

  private displayTiers:HTMLElement = document.createElement("p");

  constructor() { }

  /**
   * on changes
   * @param changes 
   */
  ngOnChanges (changes:SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) { // First change is always on init
          switch (propName) {
            case "tiers":
              this.displayTiers.innerText = this.createStringOfTiers();
              break;
            case "errorLogging":
              switch (this.errorLogging) {
                case Errors.NO_ERROR:
                  this.log(ErrorMessages.NO_ERROR.toString());
                  break;
                case Errors.TIER_ERROR:
                  this.log(ErrorMessages.TIER_ERROR.toString());
                  break;
                case Errors.FILE_ERROR:
                  this.log(ErrorMessages.FILE_ERROR.toString());
                  break;
                case Errors.TOO_MANY_FILES_ERROR:
                  this.log(ErrorMessages.TOO_MANY_FILES_ERROR.toString());
                  break;
                case Errors.WRONG_FILE_TYPE_ERROR:
                  this.log(ErrorMessages.WRONG_FILE_TYPE_ERROR.toString());
                  break;
                case Errors.UNHANDLED_ERROR:
                  this.log(ErrorMessages.UNHANDLED_ERROR.toString());
                  break;
              }
              break;
          }
        }
      }
    }
  }

  private createStringOfTiers = () => {
    let returnString:string = "The following tier names can be used for the provided file: ";

    for (let i = 0; i < this.tiers.length; i ++) {
      returnString += this.tiers[i];
      if (i != this.tiers.length - 1) {
        returnString += ", "
      }
    }
    return returnString;
  }

  private log = (message:string) => {
    document.getElementById("logging").innerText = message;
  }

}
