import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { DashboardCardMiniComponent } from './components/dashboard-card-mini/dashboard-card-mini.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { DashboardStatisticsPageComponent } from './dashboard-statistics-page/dashboard-statistics-page.component';
import { DashboardStreamPageComponent } from './dashboard-stream-page/dashboard-stream-page.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'stream' },
      { path: 'stream', component: DashboardStreamPageComponent },
      { path: 'statistics', component: DashboardStatisticsPageComponent },
    ],
  },
];

/** Dashboard module. */
@NgModule({
  declarations: [
    DashboardPageComponent,
    DashboardStreamPageComponent,
    DashboardStatisticsPageComponent,
    DashboardCardMiniComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    CommonSharedModule,
    AttorneyMobileSharedModule,
    AttorneySharedModule,
    CommonMobileModule,
  ],
})
export class MobileDashboardModule { }
