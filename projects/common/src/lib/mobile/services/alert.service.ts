import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

interface AlertConfig {
  /** Header text. */
  header?: string;
  /** Message text. */
  message?: string;
  /** Button text. */
  buttonText?: string;
}

interface ConfirmConfig extends AlertConfig {
  /** Is dangerous confirm. */
  isDangerous?: boolean;
  /** Cancel button text. */
  cancelButtonText?: string;
}

interface InputConfig extends AlertConfig {
  /** Prefilled value. */
  value?: string;
  /** Input placeholder */
  placeholder?: string;
}

/** Alert service. Used in mobile workspace. */
@Injectable({
  providedIn: 'root',
})
export class AlertService {

  /**
   * @constructor
   * @param alertController Alert controller.
   */
  public constructor(
    private readonly alertController: AlertController,
  ) { }

  /**
   * Ask for a confirm.
   * @param param0 Confirm config.
   */
  public showConfirmation({
    buttonText = 'OK',
    cancelButtonText = 'Cancel',
    header,
    message,
    isDangerous = false,
  }: ConfirmConfig): Observable<boolean> {
    return new Observable((subscriber) => {
      this.alertController.create({
        message,
        header,
        buttons: [
          {
            text: cancelButtonText,
            role: 'cancel',
            handler: () => {
              subscriber.next(false);
              subscriber.complete();
            },
          },
          {
            text: buttonText,
            cssClass: isDangerous ? 'danger-button' : '',
            handler: () => {
              subscriber.next(true);
              subscriber.complete();
            },
          },
        ],
      }).then(alert => alert.present() && alert.onDidDismiss());
    });
  }

  /**
   * Display notification that emits when click on button.
   * @param param0 Alert config.
   */
  public async showNotificationAlert({
    buttonText = 'OK',
    header,
    message,
  }: AlertConfig): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: buttonText,
        },
      ],
    });

    return alert.present() && alert.onDidDismiss().then();
  }

  /**
   * Ask a user to type a thing.
   * @param param0 Alert config.
   */
  public async showInputDialog({
    header,
    message = '',
    value = '',
    placeholder: label = '',
  }: InputConfig): Promise<string | undefined> {
    return this.alertController.create({
      header: header,
      message: message,
      inputs: [{
        name: 'name',
        type: 'text',
        value: value,
        placeholder: label,
      }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Submit' },
      ],
    })
      .then(alert => alert.present() && alert.onDidDismiss())
      .then(res => res && res.role === 'cancel' ? void 0 : res.data.values.name);
  }
}
