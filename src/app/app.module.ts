import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {SimpleProjectedComponent} from './simple.component';
import {OTFAComponent} from './otf.component';

@NgModule({
  declarations: [
    AppComponent,
    OTFAComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
