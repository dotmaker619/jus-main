import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { ClientsPageComponent } from './clients-page/clients-page.component';
import { ActiveClientsTableComponent } from './components/active-clients-table/active-clients-table.component';
import { PendingInvitesTableComponent } from './components/pending-invites-table/pending-invites-table.component';
import { NewInviteDialogComponent } from './dialogs/invite-form-dialog/invite-form-dialog.component';

const routes = [
  { path: '', component: ClientsPageComponent },
];

/** Clients module. */
@NgModule({
  declarations: [
    ClientsPageComponent,
    NewInviteDialogComponent,
    PendingInvitesTableComponent,
    ActiveClientsTableComponent,
  ],
  entryComponents: [NewInviteDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatTabsModule,
    CommonSharedModule,
  ],
})
export class ClientsModule { }
