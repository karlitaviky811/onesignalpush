import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import OneSignal, { OSNotificationPermission } from 'onesignal-cordova-plugin';
import { environment } from 'src/environments/environment.prod';
import { AlertController } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  constructor(private alertCtrl: AlertController, private http: HttpClient) { }

  OneSignalInit() {
    OneSignal.initialize(environment.appId);

    let myClickListener = async (event: any) => {
      let notificationData = JSON.stringify(event);
      console.log('notification data: ', notificationData);
    };
    OneSignal.Notifications.addEventListener('click', myClickListener);
  }


  // onesignal notification permission
  async OneSignalIOSPermission() {

    try {
      if (Capacitor.getPlatform() == 'ios') {
        const ios_permission = await OneSignal.Notifications.permissionNative();
        if (ios_permission != OSNotificationPermission.Authorized) {
          this.OneSignalPermission();
        } else {
          //this.requestPermission();
        }
      } else {
        // for android
        this.OneSignalPermission();
      }
    } catch (e) {
      console.log(e);
    }
  }

  OneSignalPermission(msg: string = '') {

    console.log('has permission', msg)
    try {
      const hasPermission = OneSignal.Notifications.hasPermission();
      OneSignal.User.addTags({ key: "tecnico", key2: "tecnico" });
      console.log('has permission', hasPermission)

      if (!hasPermission) {
        this.showAlert(msg)
      }
    } catch (err) {
      throw (err)
    }
  }

  showAlert(msg: string) {
    this.alertCtrl
      .create({
        header: `Allow Push Notifications${msg}`,
        message:
          'Please allow us to send you notifications to get latest offers and order updates...',
        buttons: [
          {
            text: "Don't Allow",
            role: 'cancel',
            handler: () => {
              console.log('Confirm Cancel');
              this.OneSignalPermission(" (It's mandatory)");
            },
          },
          {
            text: 'Allow',
            handler: () => {
              this.requestPermission();
            },
          },
        ],
      })
      .then((alertEl) => alertEl.present());
  }

  requestPermission() {
    console.log('request permission')
  }

  async sendNotification(msg: string, title: string, data: any = null, external_id?: any) {


    let body: any = {
      app_id: environment.appId,
      name: 'test',
      target_channel: "push",
      headings: { en: title },
      contents: { en: msg },
      android_channel_id: environment.android_channel_id,
      // small_icon: 'mipmap/ic_launcher_round',
      // large_icon: 'mipmap/ic_launcher_round',
      small_icon: 'mipmap/ic_notification',
      large_icon: 'mipmap/ic_notification_large',
      ios_sound: 'sound.wav',
      filters: [
        {
          field: 'tag',
          key: 'type',
          relation: '=',
          value: 'karla'
        },
      ],
      //data: { notification_info: 'testing notification' }, //pass any object
      data: data,
      // included_segments: ['Active Subscriptions', 'Total Subscriptions'],
    };
    const headers = new HttpHeaders()
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${environment.apiRestKey}`);
    return this.http.post<any>(
      'https://onesignal.com/api/v1/notifications',
      body,
      { headers: headers }
    );
  }



  //onesignal
  createOneSignalUser(uid: any) {
    const app_id = environment.appId;

    const body = {
      properties: {
        tags: { type: 'tecnico', uid: uid }
      },
      identity: {
        external_id: uid
      }
    };

    const headers = new HttpHeaders()
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Basic ${environment.apiRestKey}`);

    return this.http.post<any>(
      `https://onesignal.com/api/v1/apps/${app_id}/users`,
      body,
      { headers }
    );
  }


  checkOneSignalUserIdentity(uid: string) {
    const app_id = environment.appId;
    const headers = new HttpHeaders()
      .set('accept', 'application/json')
    return this.http.get<any>(
      `https://onesignal.com/api/v1/apps/${app_id}/users/by/external_id/${uid}/identity`,
      { headers }
    )
      .pipe(
        catchError((e) => {
          return of(false);
        })
      );
  }



  login(uid: any) {
    OneSignal.login(uid);
  }



}
