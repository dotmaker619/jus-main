import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@jl/common/shared';

import { ChatsPageComponent } from './chats-page/chats-page.component';
import { ChatComponent } from './components/chat/chat.component';

const routes: Routes = [
  {
    path: '',
    component: ChatsPageComponent,
    children: [
      {
        path: 'new',
        component: ChatComponent,
      },
    ],
  },
];

/** Chats module */
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    ChatsPageComponent,
    ChatComponent,
  ],
})
export class ChatsModule { }
