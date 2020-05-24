
import { Component, HostListener, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
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

  @Input() startGame:boolean;

  constructor() {}

  /**
   * Pass file content and metadata to the parent component via EventEmitters
   */
  transferFileContent = () => {
    let firstLayer = (document.getElementById("firstLayer") as HTMLInputElement).value;
    let secondLayer = (document.getElementById("secondLayer") as HTMLInputElement).value;

    if (firstLayer === "" || secondLayer === "") {
      this.errorLogging.emit(Errors.PROVIDE_BOTH_TIERS_ERROR);
    } else {
      this.fileContent.emit(this.text);
      this.fileType.emit(this.privFileType);
      this.firstLayer.emit(firstLayer);
      this.secondLayer.emit(secondLayer);
    }
  }

  /**
   * check if game can start (i.e. startGame property changed)
   * if that's the case, hide the components template
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (!changes[propName].isFirstChange()) {
          switch (propName) {
            case "startGame":
              if (this.startGame) {
                let elementsToHide = document.getElementsByClassName("hiddenWhenGameStarts");

                for (let i = 0; i < elementsToHide.length; i ++) {
                  elementsToHide.item(i).classList.add("hidden");
                }
              } else {
                // Make visible again
              }
              break;
          }
        }
      }
    }
  }

  /**
   * Get file when browsed for
   */
  getBrowsedFile = (event) => {
    this.readFile(event.target.files);
  }

  /**
   * Get file when dropped
   * @param event 
   */
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const { dataTransfer } = event;
    this.readFile(dataTransfer.files);
  }

  /**
   * Check if file is of correct type
   * Write found errors to parent component (e.g. too many files dropped)
   */
  private readFile = (files: FileList) => {
    let startButton = document.getElementById("startGame");

    if (files) {
      if (files.length > 1) {
        this.errorLogging.emit(Errors.TOO_MANY_FILES_ERROR);
        this.writeFilename("");
      } else {
        this.file = files[0];
        this.fileName = this.file.name;
        if (!this.fileName.endsWith("TextGrid")) {
          this.errorLogging.emit(Errors.WRONG_FILE_TYPE_ERROR);
          this.writeFilename("");
        } else {
          this.privFileType = "TextGrid";
          this.writeFilename(this.fileName);

          for (let i = 0; i < this.metaDataElements.length; i ++) {
            this.metaDataElements[i].classList.add("visible");
          }
          startButton.classList.add("visible");

          // read the file
          this.reader.onload = () => {
            this.text = this.reader.result;
          }
          this.reader.readAsText(this.file);

          this.errorLogging.emit(Errors.NO_ERROR);
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
