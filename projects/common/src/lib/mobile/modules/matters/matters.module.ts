import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ESignGuard } from '@jl/common/core/guards/esign.guard';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { EditMatterPageComponent } from '@jl/common/mobile/modules/matters//edit-matter-page/edit-matter-page.component';
import { NotesListComponent } from '@jl/common/mobile/modules/matters//matter-details-page/components/notes-list/notes-list.component';
import { MatterDetailsPageComponent } from '@jl/common/mobile/modules/matters//matter-details-page/matter-details-page.component';
import { MattersPageComponent } from '@jl/common/mobile/modules/matters//matters-page/matters-page.component';
import { MessagesPageComponent } from '@jl/common/mobile/modules/matters//messages-page/messages-page.component';
import {
  MatterActionButtonComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/components/matter-action-button/matter-action-button.component';
import {
  MatterMessagesCardComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/components/matter-messages-card/matter-messages-card.component';
import { NoteItemComponent } from '@jl/common/mobile/modules/matters/matter-details-page/components/note-item/note-item.component';
import {
  CloseMatterModalComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/modals/close-matter-modal/close-matter-modal.component';
import {
  EditNoteModalComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/modals/edit-note-modal/edit-note-modal.component';
import {
  NewMessageModalComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/modals/new-message-modal/new-message-modal.component';
import {
  ShowNoteModalComponent,
} from '@jl/common/mobile/modules/matters/matter-details-page/modals/show-note-modal/show-note-modal.component';
import { MatterItemComponent } from '@jl/common/mobile/modules/matters/matters-page/components/matter-item/matter-item.component';
import { MattersListComponent } from '@jl/common/mobile/modules/matters/matters-page/components/matters-list/matters-list.component';
import { MessageComponent } from '@jl/common/mobile/modules/matters/messages-page/message/message.component';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CommonMobileModule } from '../../mobile.module';

import { ConsentItemComponent } from './matter-details-page/components/consent-item/consent-item.component';
import { ConsentsListComponent } from './matter-details-page/components/consents-list/consents-list.component';
import { AddSupportModalComponent } from './matter-details-page/modals/add-support-modal/add-support-modal.component';
import { ReferMatterModalComponent } from './matter-details-page/modals/refer-matter-modal/refer-matter-modal.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'list',
    component: MattersPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'active' },
      {
        path: 'active',
        component: MattersListComponent,
        data: { statuses: [MatterStatus.Active] },
      },
      {
        path: 'pending',
        component: MattersListComponent,
        data: { statuses: [MatterStatus.Pending, MatterStatus.Draft] },
      },
      {
        path: 'completed',
        component: MattersListComponent,
        data: { statuses: [MatterStatus.Completed] },
      },
      {
        path: 'revoked',
        component: MattersListComponent,
        data: { statuses: [MatterStatus.Revoked] },
      },
    ],
  },
  { path: 'create', component: EditMatterPageComponent, canActivate: [ESignGuard], },
  { path: ':id', component: MatterDetailsPageComponent },
  { path: ':id/edit', component: EditMatterPageComponent },
  {
    path: 'messages/:id',
    component: MessagesPageComponent,
  },
];

/** Matters module for mobile workspace. */
@NgModule({
  declarations: [
    MattersPageComponent,
    MattersListComponent,
    MatterItemComponent,
    MatterDetailsPageComponent,
    NoteItemComponent,
    NotesListComponent,
    MatterMessagesCardComponent,
    NewMessageModalComponent,
    MessagesPageComponent,
    MessageComponent,
    ShowNoteModalComponent,
    EditNoteModalComponent,
    CloseMatterModalComponent,
    MatterActionButtonComponent,
    EditMatterPageComponent,
    ConsentsListComponent,
    ConsentItemComponent,
    ReferMatterModalComponent,
    AddSupportModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    MatAutocompleteModule,
    CommonMobileModule,
    NgxPermissionsModule.forChild(),
  ],
  entryComponents: [
    ShowNoteModalComponent,
    EditNoteModalComponent,
    CloseMatterModalComponent,
    NewMessageModalComponent,
    ReferMatterModalComponent,
    AddSupportModalComponent,
  ],
  exports: [
    MattersPageComponent,
    MattersListComponent,
    MatterItemComponent,
    MatterDetailsPageComponent,
    NoteItemComponent,
    NotesListComponent,
    MatterMessagesCardComponent,
    NewMessageModalComponent,
    MessagesPageComponent,
    MessageComponent,
    ShowNoteModalComponent,
    EditNoteModalComponent,
    CloseMatterModalComponent,
    MatterActionButtonComponent,
    EditMatterPageComponent,
  ],
})
export class MobileBaseMattersModule { }
