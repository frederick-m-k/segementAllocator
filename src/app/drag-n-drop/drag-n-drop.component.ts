
import { Component, HostListener, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';

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

  @Input() startGame: boolean;
  @Input() restartGame: boolean;

  private fileName: string;
  private file: File;
  private privFileType: string;
  private reader = new FileReader();
  private text: string | ArrayBuffer;

  private allTiers: Array<string> = new Array();
  private selectedLayers: Set<string> = new Set();

  private enterPossible: boolean;

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

      this.fileContent.emit((this.text as string));
      this.fileType.emit(this.privFileType);
      this.firstLayer.emit(firstLayer);
      this.secondLayer.emit(secondLayer);

      this.enterPossible = false;
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
              }
              break;
            case "restartGame":
              let elementsToShow = document.getElementsByClassName("hiddenWhenGameStarts");
              if (this.restartGame) {
                for (let i = 0; i < elementsToShow.length; i++) {
                  elementsToShow.item(i).classList.remove("hidden");
                }
                this.reset();
              }
              break;
          }
        }
      }
    }
  }

  private reset = (): void => {
    this.selectedLayers = new Set();
    this.showLayers();
    document.getElementById("startGame").classList.remove("visible");
    this.fileContent.emit(null);
    this.fileType.emit(null);
    this.firstLayer.emit(null);
    this.secondLayer.emit(null);
  }

  /**
   * Get file when browsed for
   */
  getBrowsedFile = (event) => {
    this.readFile(event.target.files);
  }

  /**
   * Check if file is of correct type
   * Write found errors to parent component (e.g. too many files dropped)
   */
  private readFile = (files: FileList) => {
    if (files) {
      if (files.length > 1) {
        this.writeFilename("");
      } else {
        this.file = files[0];
        this.fileName = this.file.name;
        if (!this.fileName.endsWith("TextGrid")) {
          this.writeFilename("");
        } else {
          this.privFileType = "TextGrid";
          this.writeFilename(this.fileName);

          for (let i = 0; i < this.metaDataElements.length; i++) {
            this.metaDataElements[i].classList.add("visible");
          }

          // read the file
          this.reader.onload = () => {
            this.text = this.reader.result;
            this.getLayerNames((this.text as string));
            this.showLayers();
          }
          this.reader.readAsText(this.file);

        }
      }
    }
  }


  ///////////////
  // Shortcuts //
  ///////////////
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.enterPossible) {
      switch (event.key) {
        case "Enter":
          event.preventDefault();
          this.transferFileContent();
          break;
        case "ArrowLeft":
          event.preventDefault();
          // Select layers by arrow keys
          break;
        case "ArrowRight":
          event.preventDefault();
          // Select layers by arrow keys
          break;
      }
    }
  }

  ///////////////////////////////////
  // Host Listeners for dragevents //
  ///////////////////////////////////
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

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.dropEffect = "copy";
  }
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.dropEffect = "copy";
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
    event.dataTransfer.dropEffect = "none";
    event.dataTransfer.effectAllowed = "none";
  }
  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "none";
    event.dataTransfer.effectAllowed = "none";
  }


  private writeFilename = (msg: string): void => {
    document.getElementById("filename").innerText = msg;
    if (msg == "") {
      document.getElementById("layers").innerText = "";
      let wrapper: HTMLElement = document.getElementById("layerContainer");
      while (wrapper.firstChild) {
        wrapper.removeChild(wrapper.lastChild);
      }
      document.getElementById("startGame").classList.remove("visible");
    }
  }

  private showLayers = (): void => {
    document.getElementById("layers").innerText = "Choose two layers";
    let wrapper: HTMLElement = document.getElementById("layerContainer");
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.lastChild);
    }
    for (let index = 0; index < this.allTiers.length; index++) {
      let layerName: string = this.allTiers[index];
      let div: HTMLDivElement = document.createElement("div");
      div.style.border = "4px solid #ababab";
      div.style.borderRadius = "4px";
      div.style.backgroundColor = "#f0f0f0";
      div.style.display = "inline-block";
      div.style.margin = "5px";
      div.style.padding = "3px 20px";
      div.style.cursor = "pointer";
      div.onclick = () => {
        if (this.selectedLayers.has(layerName)) {
          this.selectedLayers.delete(layerName);
          div.style.border = "4px solid #ababab";
        } else if (this.selectedLayers.size < 2) {
          this.selectedLayers.add(layerName);
          div.style.border = "4px solid #9c0a00";
        }
        if (this.selectedLayers.size == 2) {
          this.enterPossible = true;
          document.getElementById("startGame").classList.add("visible");
        } else {
          this.enterPossible = false;
          document.getElementById("startGame").classList.remove("visible");
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


  /**
   * 
   */
  private getLayerNames = (fileContent: string): void => {
    // TODO this is very TextGrid related
    let lines: string[] = fileContent.split("\n");
    this.allTiers = new Array();
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

  toggleSupportedFormats = (): void => {
    let element: HTMLElement = document.getElementById("file_info");
    if (element.innerText.includes("TextGrid")) {
      element.innerHTML = "Supported file formats";
    } else {
      element.innerHTML = "Supported file formats<br />------<br />TextGrid";
    }
  }
}
