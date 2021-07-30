import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { AttorneySharedModule } from '@jl/attorney/shared/shared.module';
import { SocialPostDetailsPageComponent } from '@jl/common/desktop/components/social-post-details-page/social-post-details-page.component';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { SelectAttorneysComponent } from './components/select-attorneys/select-attorneys.component';
import { SocialPageAsideComponent } from './components/social-page-aside/social-page-aside.component';
import { CreateNetworkDialogComponent } from './dialogs/create-network-dialog/create-network-dialog.component';
import { InviteToNetworkDialogComponent } from './dialogs/invite-to-network-dialog/invite-to-network-dialog.component';
import { NetworkInfoDialogComponent } from './dialogs/network-info-dialog/network-info-dialog.component';
import { SavePostComponent } from './modals/save-post/save-post.component';
import { NetworkChatsPageComponent } from './network-chats-page/network-chats-page.component';
import { SocialPageComponent } from './social-page/social-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SocialPageComponent },
  {
    path: 'networks',
    component: NetworkChatsPageComponent,
  },
  {
    path: 'networks/:id',
    component: NetworkChatsPageComponent,
  },
  { path: ':id', component: SocialPostDetailsPageComponent },
];

/** Social module. */
@NgModule({
  declarations: [
    SocialPageComponent,
    SavePostComponent,
    CreateNetworkDialogComponent,
    NetworkChatsPageComponent,
    NetworkInfoDialogComponent,
    InviteToNetworkDialogComponent,
    SelectAttorneysComponent,
    SocialPageAsideComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonDesktopModule,
    AttorneySharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
  ],
  entryComponents: [
    SavePostComponent,
    CreateNetworkDialogComponent,
    NetworkInfoDialogComponent,
    InviteToNetworkDialogComponent,
  ],
})
export class SocialModule { }
