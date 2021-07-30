import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import MapTypeStyle = google.maps.MapTypeStyle;
import { environment } from '@jl/env/environment';

/**
 * Stripe config.
 */
interface StripeConfig {
  /**
   * Stripe public key.
   */
  publicKey: string;
  /**
   * Locale.
   */
  locale: 'en';
}

/**
 * App config service.
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  /**
   * @constructor
   * @param platform Platform service.
   */
  public constructor(private readonly platform: Platform) {
  }

  /**
   * API base URL.
   */
  public apiUrl = environment.apiUrl;

  /**
   * Is Chats feature enabled.
   */
  public chatsEnabled = environment.chatsEnabled;

  /**
   * Web version URL.
   */
  public webVersionUrl = environment.webApplicationVersionUrl;

  /**
   * Client dashboard video source.
   */
  public clientDashboardVideoUrl = environment.clientDashboardVideo;

  /**
   * Style configuration for google map.
   */
  public googleMapStyle = environment.googleMap.styles as MapTypeStyle[];

  /**
   * Stripe configuration.
   */
  public stripeConfig: StripeConfig = {
    publicKey: environment.stripe.publicKey,
    locale: 'en',
  };

  /**
   * About Us page URL.
   */
  public aboutUsPageUrl = environment.aboutUsPageUrl;

  /**
   * License key for pdftron lib.
   */
  public readonly pdfTronLicenseKey = environment.pdfTronLicenseKey;

  /**
   * Is using of subscriptions management allowed in the application.
   * Currently, subscriptions are not allowed on iOS app.
   */
  public readonly isAttorneySubscriptionAllowed: boolean = !(
    this.platform.is('cordova') &&
    this.platform.is('ios')
  );
}
