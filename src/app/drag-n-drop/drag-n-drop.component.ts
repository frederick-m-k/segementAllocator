
import { Component, HostListener, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Errors } from './../errors';
import { discardPeriodicTasks } from '@angular/core/testing';

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


  private fileName: string;
  private file: File;
  private privFileType: string;
  private reader = new FileReader();
  private text: string | ArrayBuffer;

  private allTiers: Array<string> = new Array();
  private selectedLayers: Set<string> = new Set();

  private metaDataElements = document.getElementsByClassName("metaData");

  constructor() { }

  /**
   * Pass file content and metadata to the parent component via EventEmitters
   */
  transferFileContent = () => {
    if (this.selectedLayers.size == 2) {
      let iterator = this.selectedLayers.values();
      let firstLayer: string = iterator.next().value;
      let secondLayer: string = iterator.next().value;
      console.log(firstLayer, secondLayer);

      this.fileContent.emit((this.text as string));
      this.fileType.emit(this.privFileType);
      this.firstLayer.emit(firstLayer);
      this.secondLayer.emit(secondLayer);
    } else {
      this.errorLogging.emit(Errors.PROVIDE_BOTH_TIERS_ERROR);
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
      } else {
        this.file = files[0];
        this.fileName = this.file.name;
        if (!this.fileName.endsWith("TextGrid")) {
          this.errorLogging.emit(Errors.WRONG_FILE_TYPE_ERROR);
          this.writeFilename("");
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
            this.getLayerNames((this.text as string));
            this.showLayers();
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

  private writeFilename = (msg: string): void => {
    document.getElementById("filename").innerText = msg;
    if (msg != "") {
      document.getElementById("layers").innerText = "Choose two layers";
    }
  }

  private showLayers = (): void => {
    let wrapper: HTMLElement = document.getElementById("layerContainer");
    for (let index = 0; index < this.allTiers.length; index++) {
      let layerName: string = this.allTiers[index];
      let div: HTMLDivElement = document.createElement("div");
      div.style.border = "4px solid #ababab";
      div.style.borderRadius = "4px";
      div.style.backgroundColor = "#f0f0f0";
      div.style.display = "inline-block";
      div.style.margin = "0 5px";
      div.style.padding = "10px";
      div.onclick = () => {
        if (this.selectedLayers.has(layerName)) {
          this.selectedLayers.delete(layerName);
          div.style.border = "4px solid #ababab";
        } else if (this.selectedLayers.size < 2) {
          this.selectedLayers.add(layerName);
          div.style.border = "4px solid #9c0a00";
        }
      };
      let text: HTMLParagraphElement = document.createElement("p");
      text.innerText = layerName;
      text.style.color = "#38424c";
      text.style.fontFamily = "Palatino, Times, serif";
      text.style.fontSize = "18px";
      div.appendChild(text);
      wrapper.appendChild(div);
    }
  }

  private toggleClickedLayer = (): void => {

  }


  /**
   * 
   */
  private getLayerNames = (fileContent: string): void => {
    // TODO this is very TextGrid related
    let lines: string[] = fileContent.split("\n");
    for (let index = 0; index < lines.length; index++) {
      let curLine: string = lines[index];
      if (curLine.includes("name =")) {
        if (!curLine.includes("mark =") && !curLine.includes("text =")) { // Just to skip "name =" written in the segments
          let layer: string = curLine.split("=")[1].trim().replace(/"/g, "");
          this.allTiers.push(layer);
        }
      }
    }
  }
}
