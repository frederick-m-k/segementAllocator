
import { Component, OnInit, HostListener, Host } from '@angular/core';

@Component({
  selector: 'app-drag-n-drop',
  templateUrl: './drag-n-drop.component.html',
  styleUrls: ['./drag-n-drop.component.css']
})
export class DragNDropComponent implements OnInit {

  private fileName:string;
  private file;

  constructor() { }

  ngOnInit(): void {
  } 

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    let loggingElement = document.getElementById("logging");

    const { dataTransfer } = event;

    if (dataTransfer.items) {
      if (dataTransfer.items.length > 1) {
        loggingElement.innerText = "Provide only one file!";
      } else {
        if (dataTransfer.items[0].kind === 'file') {
          this.file = dataTransfer.items[0].getAsFile();
          this.fileName = this.file.name;
        }
        if (!this.fileName.endsWith("TextGrid")) {
          loggingElement.innerText = "Provide a .TextGrid file!"
        } else {
          loggingElement.innerText = this.fileName;
        }
      }
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Prevent Dropping on the body
  @HostListener('body:drop', ['$event'])
  onBodyDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

}
