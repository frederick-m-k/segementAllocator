import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import { GameComponent } from './game/game.component';
import { ParseFilesComponent } from './parse-files/parse-files.component';

@NgModule({
  declarations: [
    AppComponent,
    DragNDropComponent,
    GameComponent,
    ParseFilesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
