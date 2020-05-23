import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import { GameComponent } from './game/game.component';
import { CheckTextGridDirective } from './file-checking/check-text-grid/check-text-grid.directive';
import { FileCheckingDirective } from './file-checking/file-checking.directive';

@NgModule({
  declarations: [
    AppComponent,
    DragNDropComponent,
    GameComponent,
    CheckTextGridDirective,
    FileCheckingDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
