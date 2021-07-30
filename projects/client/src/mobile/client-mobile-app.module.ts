import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { CoreModule } from '@jl/common/core';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { MobileNotificationReceivingService } from '@jl/common/mobile/services/mobile-notification-receiving.service';

import { clientAppImports, clientAppProviders } from '../client-dependencies';

import { AppRoutingModule } from './client-mobile-app-routing.module';
import { ClientMobileAppComponent } from './client-mobile-app.component';
/**
 * Application root module.
 */
@NgModule({
  declarations: [
    ClientMobileAppComponent,
  ],
  providers: [
    ...clientAppProviders,
    { provide: NotificationReceivingService, useClass: MobileNotificationReceivingService },
  ],
  imports: [
    ...clientAppImports,
    AppRoutingModule,
    CoreModule,
    IonicModule,
    ClientSharedModule,
    CommonMobileModule,
  ],
})
export class ClientMobileAppModule { }
