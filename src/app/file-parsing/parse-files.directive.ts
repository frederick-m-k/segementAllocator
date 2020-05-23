import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appParseFiles]'
})
export class ParseFilesDirective {

  @Input() fileType: string;
  @Input() fileContent: string;

  constructor() { }

}
