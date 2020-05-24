
import { Component, Input, SimpleChanges, Output } from '@angular/core';
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
              if (this.errorLogging === Errors.TIER_ERROR) {
                this.logTiers(this.createStringOfTiers());
              }
              break;
            case "errorLogging":
              switch (this.errorLogging) {
                case Errors.NO_ERROR:
                  this.logError(ErrorMessages.NO_ERROR.toString());
                  this.logTiers("");
                  break;
                case Errors.TIER_ERROR:
                  this.logError(ErrorMessages.TIER_ERROR.toString());
                  break;
                case Errors.TOO_MANY_FILES_ERROR:
                  this.logError(ErrorMessages.TOO_MANY_FILES_ERROR.toString());
                  break;
                case Errors.WRONG_FILE_TYPE_ERROR:
                  this.logError(ErrorMessages.WRONG_FILE_TYPE_ERROR.toString());
                  this.logTiers("");
                  break;
                case Errors.PROVIDE_BOTH_TIERS_ERROR:
                  this.logError(ErrorMessages.PROVIDE_BOTH_TIERS_ERROR.toString());
                  this.logTiers("");
                  break;
                case Errors.UNHANDLED_ERROR:
                  this.logError(ErrorMessages.UNHANDLED_ERROR.toString());
                  this.logTiers("");
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

  private logError = (message:string) => {
    document.getElementById("logging").innerText = message;
  }

  private logTiers = (msg:string) => {
    document.getElementById("tierLogging").innerText = msg;
  }

}
