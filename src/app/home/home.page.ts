import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonText } from '@ionic/angular/standalone';
import { OnesignalService } from '../services/onesignal/onesignal.service';
import { lastValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonText, IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  constructor(private toastCtrl: ToastController) { }
  oneSignalService = inject(OnesignalService)
  ngOnInit() {
    console.log('ngoninit');
    this.oneSignal();
  }

  async oneSignal() {
    try {
      await this.oneSignalService.OneSignalIOSPermission();
    } catch (e) {
      console.log(e);
    }
  }

  sendNotificationtoSpecificDevice() {
    console.log('send notification')
    
  }

  async oneSignalPermission(){
    await this.oneSignalService.OneSignalIOSPermission();
  }
 
  getStorage(key: string) {
    return Preferences.get({ key: key });
  }

  async createOneSignalUser() {
    try {
      const data = await this.getStorage('auth');
      console.log('stored data: ', data);
      if(!data || !data?.value) {
        this.createUserAndLogin();
        return;
      }
      console.log('external id: ', data.value);
      const response = await lastValueFrom(this.oneSignalService.checkOneSignalUserIdentity(data.value));
      if(!response) {
        this.createUserAndLogin();
      } else {
        const { identity } = response;
        console.log('identity: ', identity);
        if(!identity?.external_id) {
          this.createUserAndLogin();
        } else {
          this.oneSignalService.login(identity?.external_id);
          this.showToast('User already registered in onesignal');
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  async createUserAndLogin() {
    try {
      const randomNumber: string = this.generateRandomString(20);
      console.log('stored number: ', randomNumber);
      await lastValueFrom(this.oneSignalService.createOneSignalUser(randomNumber));
      await Preferences.set({ key: 'auth', value: randomNumber });
      this.oneSignalService.login(randomNumber);
      this.showToast('User created in onesignal');
    } catch(e) {
      throw(e);
    }
  }
  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  } 
  async showToast(msg: string, color: string = 'success', duration = 3000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
