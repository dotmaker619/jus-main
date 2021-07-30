import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatDatepickerModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonSharedModule as CommonSharedModule } from '@jl/common/shared/shared.module';

import { BadgeListComponent } from './components/badge-list/badge-list.component';
import { BillableHoursComponent } from './components/dashboard-charts/billable-hours/billable-hours.component';
import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';
import { QuarterStatisticComponent } from './components/dashboard-charts/quarter-statistic/quarter-statistic.component';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { PaymentMessageComponent } from './components/payment-message/payment-message.component';
import { NoActiveSubscriptionPageComponent } from './no-active-subscription-page/no-active-subscription-page.component';
import { SubscriptionIsNotAllowedPageComponent } from './subscription-is-not-allowed-page/subscription-is-not-allowed-page.component';

/** Shared module for mobile-app. */
@NgModule({
  entryComponents: [
    HeaderMenuComponent,
  ],
  declarations: [
    HeaderComponent,
    HeaderMenuComponent,
    NoActiveSubscriptionPageComponent,
    SubscriptionIsNotAllowedPageComponent,
    QuarterStatisticComponent,
    BillableHoursComponent,
    BadgeListComponent,
    DashboardChartsComponent,
    PaymentMessageComponent,
  ],
  exports: [
    HeaderComponent,
    HeaderMenuComponent,
    QuarterStatisticComponent,
    BillableHoursComponent,
    DashboardChartsComponent,
    BadgeListComponent,
    PaymentMessageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
    MatMenuModule,
    CommonSharedModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
  ],
})
export class AttorneySharedModule { }
