import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import { GameComponent } from './game/game.component';
import { FileCheckingDirective } from './file-checking/file-checking.directive';
import { ParseFilesDirective } from './file-parsing/parse-files.directive';

@NgModule({
  declarations: [
    AppComponent,
    DragNDropComponent,
    GameComponent,
    FileCheckingDirective,
    ParseFilesDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
