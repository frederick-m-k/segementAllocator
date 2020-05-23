import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appFileChecking]'
})
export class FileCheckingDirective {

  @Input() private fileType:string;

  @Input() private fileContent: string;

  constructor() { console.log("Temp"); }

}
