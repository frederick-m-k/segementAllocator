import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() private firstLayer: [[number, number, string]];
  @Input() private secondLayer: [[number, number, string]]; 
  @Input() private data:Map<string, Array<Array<number | string>>>;
  @Input() private startGame:boolean;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes:SimpleChanges) {
    
  }

}
