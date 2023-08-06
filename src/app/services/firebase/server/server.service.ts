import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public domain: string = environment.root_url;
///api/v1/gcmdevices/
  constructor() { }

  async registerDeviceToken(userToken: string, deviceName: string, deviceId: string, registrationId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {

      const url = this.domain + '/api/v1/gcmdevices/';

      //transform device id to number hex
      const hex = parseInt(deviceId, 16);
      console.log("Device ID hex: " + hex);
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + userToken
        },
        body: JSON.stringify({
          name: deviceName,
          device_id: hex,
          registration_id: registrationId,
          cloud_message_type: 'FCM'
        })

      }).then(async response => {
        const data = await response.json();
        console.log("Response server: " + response.status);
        if (response.status === 201 || response.status === 200) {
          resolve(true)
        } else {
          resolve(false);
        }
      }).catch(error => {
        reject(error);
      });

    });
  }

  async sendGlobalPushNotification(userToken: string, title: string, message: string, image: string): Promise<any> {

    return new Promise(async (resolve, reject) => {

      const url = this.domain + '/api/v1/send-push-notification/';
      const extra = '{"type": "global"}'

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + userToken
        },
        body: JSON.stringify({
          title: title,
          message: message,
          image: image,
          extra: extra
        })
      }).then(async response => {
        const data = await response.json();
        if (response.status === 201 || response.status === 200) {
          resolve(true)
        } else {
          resolve(false);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }
}
