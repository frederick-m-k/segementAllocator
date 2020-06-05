
import { Component, Input, SimpleChanges, Output } from '@angular/core';
import { Errors, ErrorMessages } from './../errors'

/**
 * Responsible for gathering and displaying errors
 */
@Component({
  selector: 'app-error-logging',
  templateUrl: './error-logging.component.html',
  styleUrls: ['./error-logging.component.css']
})
export class ErrorLoggingComponent {

  @Input() private errorLogging: Errors;

  constructor() { }

  /**
   * get errors passed by parent component
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) { // First change is always on init
          switch (propName) {
            case "errorLogging":
              switch (this.errorLogging) {
                case Errors.NO_ERROR:
                  this.logError(ErrorMessages.NO_ERROR.toString());
                  break;
                case Errors.TIER_ERROR:
                  this.logError(ErrorMessages.TIER_ERROR.toString());
                  break;
                case Errors.TOO_MANY_FILES_ERROR:
                  this.logError(ErrorMessages.TOO_MANY_FILES_ERROR.toString());
                  break;
                case Errors.WRONG_FILE_TYPE_ERROR:
                  this.logError(ErrorMessages.WRONG_FILE_TYPE_ERROR.toString());
                  break;
                case Errors.PROVIDE_BOTH_TIERS_ERROR:
                  this.logError(ErrorMessages.PROVIDE_BOTH_TIERS_ERROR.toString());
                  break;
                case Errors.UNHANDLED_ERROR:
                  this.logError(ErrorMessages.UNHANDLED_ERROR.toString());
                  break;
              }
              break;
          }
        }
      }
    }
  }

  private logError = (message: string) => {
    document.getElementById("logging").innerText = message;
  }

}
