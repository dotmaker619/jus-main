import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { CommonMobileModule } from '../../mobile.module';

import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { PreferencesModalComponent } from './components/preferences-modal/preferences-modal.component';
import { NotificationsPageComponent } from './notifications-page/notifications-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: NotificationsPageComponent,
  },
];

/**
 * Notifications module fow mobile workspace.
 */
@NgModule({
  declarations: [
    NotificationsPageComponent,
    NotificationItemComponent,
    PreferencesModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    CommonSharedModule,
    CommonMobileModule,
  ],
  entryComponents: [
    PreferencesModalComponent,
  ],
})
export class MobileNotificationsModule { }
