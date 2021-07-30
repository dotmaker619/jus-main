import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NetworkChatService } from '@jl/common/core/services/chats/network-chat.service';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { CreateNetworkPageComponent } from './create-network-page/create-network-page.component';
import { InviteToNetworkPageComponent } from './invite-to-network-modal/invite-to-network-page.component';
import { NetworkInformationComponent } from './modals/network-information/network-information.component';
import { SavePostComponent } from './modals/save-post/save-post.component';
import { SelectAttorneysModalComponent } from './modals/select-attorneys-modal/select-attorneys-modal.component';
import { NetworkChatPageComponent } from './network-chat-page/network-chat-page.component';
import { NetworksPageComponent } from './networks-page/networks-page.component';
import { SocialPageComponent } from './social-page/social-page.component';
import { SocialPostDetailsPageComponent } from './social-post-details-page/social-post-details-page.component';

const routes: Routes = [
  { path: '', component: SocialPageComponent },
  { path: 'network/create', component: CreateNetworkPageComponent },
  { path: 'networks', component: NetworksPageComponent },
  { path: 'networks/:id', component: NetworkChatPageComponent },
  { path: 'networks/:id/invite', component: InviteToNetworkPageComponent },
  { path: ':id', component: SocialPostDetailsPageComponent },
];

/** Social module for mobile device. */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CommonMobileModule,
  ],
  exports: [],
  declarations: [
    CreateNetworkPageComponent,
    SelectAttorneysModalComponent,
    NetworksPageComponent,
    NetworkChatPageComponent,
    SocialPageComponent,
    SocialPostDetailsPageComponent,
    SavePostComponent,
    NetworkInformationComponent,
    InviteToNetworkPageComponent,
  ],
  entryComponents: [
    SelectAttorneysModalComponent,
    SavePostComponent,
    NetworkInformationComponent,
  ],
})
export class SocialModule { }
