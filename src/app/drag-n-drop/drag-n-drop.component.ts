
import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drag-n-drop',
  templateUrl: './drag-n-drop.component.html',
  styleUrls: ['./drag-n-drop.component.css']
})
export class DragNDropComponent implements OnInit {

  @Output() fileContent = new EventEmitter();
  @Output() filetype = new EventEmitter();

  private fileName:string;
  private file;
  private fileType:string;
  private reader = new FileReader();
  private text:string | ArrayBuffer;

  private metaDataElements = document.getElementsByClassName("metaData");

  private firstLayer:string;
  private secondLayer:string;

  constructor() {
  }

  ngOnInit(): void {
  }

  transferFileContent = () => {
    let firstLayer = (document.getElementById("firstLayer") as HTMLInputElement).value;
    let secondLayer = (document.getElementById("secondLayer") as HTMLInputElement).value;

    let loggingElement = document.getElementById("logging");
    if (firstLayer === "" || secondLayer === "") {
      loggingElement.innerText = "Both layers should be provided!"
    } else {
      loggingElement.innerText = "";
      this.fileContent.emit(this.text);
      this.filetype.emit(this.fileType);

      let startScreen = document.getElementsByClassName("hiddenWhenGameStarts");
      for (let i = 0; i < startScreen.length; i ++) {
        startScreen[i].classList.add("hidden");
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    let filenameElement = document.getElementById("filename");
    let startButton = document.getElementById("startGame");
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
          this.fileType = "TextGrid";
          filenameElement.innerText = this.fileName;
          loggingElement.innerText = "";

          for (let i = 0; i < this.metaDataElements.length; i ++) {
            this.metaDataElements[i].classList.add("visibleMetaData");
          }
          startButton.classList.add("visibleStartGame");

          // read the file
          this.reader.onload = () => {
            this.text = this.reader.result;
          }
          this.reader.readAsText(this.file);
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
