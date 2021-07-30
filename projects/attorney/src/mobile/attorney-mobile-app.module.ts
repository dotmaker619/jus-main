import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { MobileNotificationReceivingService } from '@jl/common/mobile/services/mobile-notification-receiving.service';

import { attorneyAppProviders, attorneyAppImports } from '../attorney-dependencies';
import { NotificationReceivingService } from '../shared/services/notification-receiving.service';

import { AttorneyMobileAppRoutingModule } from './attorney-mobile-app-routing.module';
import { AttorneyMobileAppComponent } from './attorney-mobile-app.component';
import { SubscriptionNotAllowedPageComponent } from './subscription-not-allowed-page/subscription-not-allowed-page.component';

/** Mobile workspace module. */
@NgModule({
  declarations: [
    AttorneyMobileAppComponent,
    SubscriptionNotAllowedPageComponent,
  ],
  imports: [
    CommonModule,
    AttorneyMobileAppRoutingModule,
    ...attorneyAppImports,
    IonicModule,
    CommonMobileModule,
  ],
  providers: [
    ...attorneyAppProviders,
    { provide: NotificationReceivingService, useClass: MobileNotificationReceivingService },
  ],
})
export class AttorneyMobileAppModule { }
