import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() firstLayer: [[number, number, string]];
  @Input() secondLayer: [[number, number, string]];

  constructor() { }

  ngOnInit(): void {
  }

}
