import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { ActiveClientsPageComponent } from './active-clients-page/active-clients-page.component';
import { ClientsPageComponent } from './clients-page/clients-page.component';
import { ActiveListItemComponent } from './components/active-list-item/active-list-item.component';
import { InviteClientModalComponent } from './components/invite-client-modal/invite-client-modal.component';
import { PendingListItemComponent } from './components/pending-list-item/pending-list-item.component';
import { PendingClientsPageComponent } from './pending-clients-page/pending-clients-page.component';

const routes = [
  {
    path: '', component: ClientsPageComponent, children: [
      { path: '', pathMatch: 'full', redirectTo: 'active' },
      { path: 'active', component: ActiveClientsPageComponent },
      { path: 'pending', component: PendingClientsPageComponent },
    ],
  },
];

/**
 * Client module for mobile workspace.
 */
@NgModule({
  declarations: [
    ClientsPageComponent,
    ActiveClientsPageComponent,
    PendingClientsPageComponent,
    ActiveListItemComponent,
    PendingListItemComponent,
    InviteClientModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    AttorneySharedModule,
    CommonSharedModule,
    AttorneyMobileSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonMobileModule,
  ],
  entryComponents: [
    InviteClientModalComponent,
  ],
})
export class MobileClientsModule { }
