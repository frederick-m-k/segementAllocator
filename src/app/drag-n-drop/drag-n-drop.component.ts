
import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { Errors } from './../errors';

/**
 * 
 */
@Component({
  selector: 'app-drag-n-drop',
  templateUrl: './drag-n-drop.component.html',
  styleUrls: ['./drag-n-drop.component.css']
})
export class DragNDropComponent {

  @Output() fileContent = new EventEmitter();
  @Output() fileType = new EventEmitter();
  @Output() firstLayer = new EventEmitter();
  @Output() secondLayer = new EventEmitter();
  @Output() errorLogging:EventEmitter<Errors> = new EventEmitter()

  private fileName:string;
  private file;
  private privFileType:string;
  private reader = new FileReader();
  private text:string | ArrayBuffer;

  private metaDataElements = document.getElementsByClassName("metaData");

  constructor() {}

  /**
   * Transfer file content of drag ndrop component
   */
  transferFileContent = () => {
    let firstLayer = (document.getElementById("firstLayer") as HTMLInputElement).value;
    let secondLayer = (document.getElementById("secondLayer") as HTMLInputElement).value;

    if (firstLayer === "" || secondLayer === "") {
    } else {
      this.fileContent.emit(this.text);
      this.fileType.emit(this.privFileType);
      this.firstLayer.emit(firstLayer);
      this.secondLayer.emit(secondLayer);

      let startScreen = document.getElementsByClassName("hiddenWhenGameStarts");
      for (let i = 0; i < startScreen.length; i ++) {
        startScreen[i].classList.add("hidden");
      }
    }
  }

  /**
   * Hosts listener
   * @param event 
   */
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    let filenameElement = document.getElementById("filename");
    let startButton = document.getElementById("startGame");

    const { dataTransfer } = event;

    if (dataTransfer.items) {
      if (dataTransfer.items.length > 1) {
        this.errorLogging.emit(Errors.TOO_MANY_FILES_ERROR);
        this.writeFilename("");
      } else {
        if (dataTransfer.items[0].kind === 'file') {
          this.file = dataTransfer.items[0].getAsFile();
          this.fileName = this.file.name;
        }
        if (!this.fileName.endsWith("TextGrid")) {
          this.errorLogging.emit(Errors.WRONG_FILE_TYPE_ERROR);
          this.writeFilename("");
        } else {
          this.privFileType = "TextGrid";
          this.writeFilename(this.fileName);

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

    private writeFilename = (msg:string) => {
      document.getElementById("filename").innerText = msg;
    }
}
