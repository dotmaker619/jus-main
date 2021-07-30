import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';

import { ActiveLeadsComponent } from './components/active-leads/active-leads.component';
import { LeadsChatComponent } from './components/leads-chat/leads-chat.component';
import { OpportunitiesTableComponent } from './components/opportunities-table/opportunities-table.component';
import { OpportunityComponent } from './components/opportunity/opportunity.component';
import { LeadsPageComponent } from './leads-page/leads-page.component';

/**
 * Leads routes.
 */
const routes: Routes = [
  {
    path: '',
    component: LeadsPageComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OpportunityComponent,
      },
      {
        path: 'active',
        component: ActiveLeadsComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

/**
 * Leads module.
 */
@NgModule({
  imports: [
    CommonModule,
    CommonSharedModule,
    AttorneySharedModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LeadsPageComponent,
    LeadsChatComponent,
    OpportunityComponent,
    ActiveLeadsComponent,
    OpportunitiesTableComponent,
  ],
})
export class LeadsModule { }
