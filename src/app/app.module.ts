import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DragNDropComponent } from './drag-n-drop/drag-n-drop.component';
import { GameComponent } from './game/game.component';
import { PrepFileComponent } from './prep-file/prep-file.component';
import { ErrorLoggingComponent } from './error-logging/error-logging.component';

@NgModule({
  declarations: [
    AppComponent,
    DragNDropComponent,
    GameComponent,
    PrepFileComponent,
    ErrorLoggingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
