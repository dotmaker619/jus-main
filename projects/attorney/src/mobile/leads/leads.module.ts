import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { ActiveLeadsPageComponent } from './active-leads-page/active-leads-page.component';
import { ActiveLeadItemComponent } from './components/active-lead-item/active-lead-item.component';
import { LeadPreferencesComponent } from './components/lead-preferences/lead-preferences.component';
import { LeadsPageComponent } from './leads-page/leads-page.component';
import { ChatModalComponent } from './modals/chat-modal/chat-modal.component';
import { OpportunitiesPageComponent } from './opportunities-page/opportunities-page.component';

const routes: Routes = [
  {
    path: '',
    component: LeadsPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'opportunities' },
      { path: 'opportunities', pathMatch: 'full', component: OpportunitiesPageComponent, },
      { path: 'active', component: ActiveLeadsPageComponent, },
    ],
  },
];

/**
 * Leads module for mobile workspace.
 */
@NgModule({
  declarations: [
    LeadsPageComponent,
    OpportunitiesPageComponent,
    ActiveLeadsPageComponent,
    LeadPreferencesComponent,
    ActiveLeadItemComponent,
    ChatModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    AttorneyMobileSharedModule,
    AttorneySharedModule,
    CommonSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonMobileModule,
  ],
  entryComponents: [
    LeadPreferencesComponent,
    ChatModalComponent,
  ],
})
export class MobileLeadsModule { }
