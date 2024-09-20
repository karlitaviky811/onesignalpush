import { PlatformLocation } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { IonHeader, IonButton, IonToolbar, Platform } from '@ionic/angular/standalone';
import OneSignal from 'onesignal-cordova-plugin';
import { OnesignalService } from './services/onesignal/onesignal.service';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  platform = inject(Platform)
  oneSignalService = inject(OnesignalService)
  constructor(platform: Platform) {
    console.log('this.validation', Capacitor.getPlatform())

    this.platform.ready().then(()=>{
      if(Capacitor.getPlatform() != 'web') this.oneSignalService.OneSignalInit();
    })
   
  }




}
