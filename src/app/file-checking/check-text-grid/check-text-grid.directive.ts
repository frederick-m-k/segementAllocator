import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appCheckTextGrid]'
})
export class CheckTextGridDirective {

  @Input() private fileContent:string;

  constructor() { }

}
