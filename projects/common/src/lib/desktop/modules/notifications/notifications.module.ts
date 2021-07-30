import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { NotificationsHeaderComponent } from './components/notifications-header/notifications-header.component';
import { NotificationsComponent } from './notifications.component';

export const routes: Routes = [
  { path: '', component: NotificationsComponent },
];

/** Notifications module. */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
  ],
  declarations: [NotificationsComponent, NotificationsHeaderComponent],
})
export class NotificationsModule { }
