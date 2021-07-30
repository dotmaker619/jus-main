import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { ChatsPageComponent } from './chats-page/chats-page.component';
import { ChatModalComponent } from './components/chat-modal/chat-modal.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ChatsPageComponent,
  },
];

/** Chats module. */
@NgModule({
  declarations: [ChatsPageComponent, ChatModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
  ],
  entryComponents: [
    ChatModalComponent,
  ],
})
export class ChatsModule { }
