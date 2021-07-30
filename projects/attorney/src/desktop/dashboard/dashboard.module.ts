import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';

import { DashboardActiveLeadsListComponent } from './components/dashboard-active-leads-list/dashboard-active-leads-list.component';
import { DashboardActiveMattersListComponent } from './components/dashboard-active-matters-list/dashboard-active-matters-list.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { DashboardOpportunitiesListComponent } from './components/dashboard-opportunities-list/dashboard-opportunities-list.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

/**
 * Dashboard module.
 */
@NgModule({
  declarations: [
    DashboardPageComponent,
    DashboardCardComponent,
    DashboardOpportunitiesListComponent,
    DashboardActiveLeadsListComponent,
    DashboardActiveMattersListComponent,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    DashboardRoutingModule,
    AttorneySharedModule,
  ],
})
export class DashboardModule { }
