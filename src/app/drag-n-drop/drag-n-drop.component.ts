
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

  //////////////////////
  // Input and Output //
  //////////////////////
  @Output() fileContent: EventEmitter<string> = new EventEmitter();
  @Output() fileType: EventEmitter<string> = new EventEmitter();
  @Output() firstLayer: EventEmitter<string> = new EventEmitter();
  @Output() secondLayer: EventEmitter<string> = new EventEmitter();
  @Output() errorLogging: EventEmitter<Errors> = new EventEmitter();

  @Input() startGame: boolean;

  private correctFile: boolean;

  private fileName: string;
  private file: File;
  private privFileType: string;
  private reader = new FileReader();
  private text: string | ArrayBuffer;

  private metaDataElements = document.getElementsByClassName("metaData");

  constructor() { }

  /**
   * Pass file content and metadata to the parent component via EventEmitters
   */
  transferFileContent = () => {

    let firstLayer = (document.getElementById("firstLayer") as HTMLInputElement).value;
    let secondLayer = (document.getElementById("secondLayer") as HTMLInputElement).value;

    if (firstLayer === "" || secondLayer === "") {
      this.errorLogging.emit(Errors.PROVIDE_BOTH_TIERS_ERROR);
    } else {
      console.log("test1");
      this.fileContent.emit((this.text as string));
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
              let elementsToHide = document.getElementsByClassName("hiddenWhenGameStarts");
              if (this.startGame) {
                for (let i = 0; i < elementsToHide.length; i++) {
                  elementsToHide.item(i).classList.add("hidden");
                }
              } else {
                for (let i = 0; i < elementsToHide.length; i++) {
                  elementsToHide.item(i).classList.remove("hidden");
                }
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
        this.writeTiers("");
      } else {
        this.file = files[0];
        this.fileName = this.file.name;
        if (!this.fileName.endsWith("TextGrid")) {
          this.errorLogging.emit(Errors.WRONG_FILE_TYPE_ERROR);
          this.writeFilename("");
          this.writeTiers("");
        } else {
          this.privFileType = "TextGrid";
          this.writeFilename(this.fileName);

          for (let i = 0; i < this.metaDataElements.length; i++) {
            this.metaDataElements[i].classList.add("visible");
          }
          startButton.classList.add("visible");

          // read the file
          this.reader.onload = () => {
            this.text = this.reader.result;
            this.writeTiers(this.getLayerNames((this.text as string)));
          }
          this.reader.readAsText(this.file);

          this.errorLogging.emit(Errors.NO_ERROR);

          this.correctFile = true;
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

  private writeFilename = (msg: string): void => {
    document.getElementById("filename").innerText = msg;
  }
  private writeTiers = (text: string): void => {
    document.getElementById("layers").innerText = text;
  }


  private getLayerNames = (fileContent: string): string => {
    let message: string = "Layers: ";
    let lines: string[] = fileContent.split("\n");
    let amount: number = 0;
    let counter: number = 0;
    for (let index = 0; index < lines.length; index++) {
      let curLine: string = lines[index];
      if (curLine.includes("size =")) {
        if (!curLine.includes("intervals") && !curLine.includes("text =") && !curLine.includes("mark =")) {
          amount = parseInt(curLine.split("=")[1].trim());
        }
      }
      if (curLine.includes("name =")) {
        if (!curLine.includes("mark =") && !curLine.includes("text =")) { // Just to skip "name =" written in the segments
          let toAppend: string = curLine.split("=")[1].trim().replace(/"/g, "");
          message = message.concat(toAppend);
          counter++;
          if (counter < amount) {
            message = message.concat(", ");
          }
        }
      }
    }
    return message;
  }
}
