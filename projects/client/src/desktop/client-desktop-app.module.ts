import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NotificationReceivingService } from '@jl/attorney/shared/services/notification-receiving.service';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { CoreModule } from '@jl/common/core';
import { DesktopNotificationReceivingService } from '@jl/common/desktop/services/desktop-notification-receiving.service';

import { clientAppProviders, clientAppImports } from '../client-dependencies';

import { AppRoutingModule } from './client-desktop-app-routing.module';
import { ClientDesktopAppComponent } from './client-desktop-app.component';
/**
 * Application root module.
 */
@NgModule({
  declarations: [
    ClientDesktopAppComponent,
  ],
  providers: [
    ...clientAppProviders,
    { provide: NotificationReceivingService, useClass: DesktopNotificationReceivingService },
  ],
  imports: [
    ...clientAppImports,
    CommonModule,
    AppRoutingModule,
    CoreModule,
    OverlayModule,
    ClientSharedModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ClientDesktopAppModule { }
