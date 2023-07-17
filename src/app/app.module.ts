import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MainComponent} from './main/main.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxColorsModule} from 'ngx-colors';
import {rxStompServiceFactory} from "./socket/rx-stomp-service-factory";
import {RxStompService} from "./socket/rx-stomp.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxColorsModule
  ],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
