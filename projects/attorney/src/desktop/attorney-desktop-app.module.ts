import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DesktopNotificationReceivingService } from '@jl/common/desktop/services/desktop-notification-receiving.service';

import { attorneyAppImports, attorneyAppProviders } from '../attorney-dependencies';
import { NotificationReceivingService } from '../shared/services/notification-receiving.service';
import { AttorneySharedModule } from '../shared/shared.module';

import { AttorneyDesktopAppRoutingModule } from './attorney-desktop-app-routing.module';
import { AttorneyDesktopAppComponent } from './attorney-desktop-app.component';

/** Client module. */
@NgModule({
  declarations: [
    AttorneyDesktopAppComponent,
  ],
  imports: [
    CommonModule,
    AttorneyDesktopAppRoutingModule,
    ...attorneyAppImports,
    AttorneySharedModule,
  ],
  providers: [
    ...attorneyAppProviders,
    { provide: NotificationReceivingService, useClass: DesktopNotificationReceivingService },
  ],
})
export class AttorneyDesktopAppModule { }
