import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { Routes, RouterModule } from '@angular/router';
import { AttorneyGuard } from '@jl/common/core/guards/attorney.guard';
import { ESignGuard } from '@jl/common/core/guards/esign.guard';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { MatterTopicDialogComponent } from '@jl/common/desktop/modules/matters/dialogs/matter-topic-dialog/matter-topic-dialog.component';
import { MessagesPageComponent } from '@jl/common/desktop/modules/matters/pages/messages-page/messages-page.component';
import { NgxPermissionsModule } from 'ngx-permissions';

import { DialogsModule } from '../../../shared/modules/dialogs/dialogs.module';
import { CommonSharedModule } from '../../../shared/shared.module';

import { ClientInfoComponent } from './components/client-info/client-info.component';
import { MatterInfoComponent } from './components/matter-info/matter-info.component';
import { AddSupportDialogComponent } from './dialogs/add-support-dialog/add-support-dialog.component';
import { CloseMatterDialogComponent } from './dialogs/close-matter-dialog/close-matter-dialog.component';
import { EditNoteDialogComponent } from './dialogs/edit-note-dialog/edit-note-dialog.component';
import { ReferMatterDialogComponent } from './dialogs/refer-matter-dialog/refer-matter-dialog.component';
import { ViewNoteDialogComponent } from './dialogs/view-note-dialog/view-note-dialog.component';
import { EditMatterPageComponent } from './pages/edit-matter-page/edit-matter-page.component';
import { ConsentsListComponent } from './pages/matter-details-page/components/consents-list/consents-list.component';
import { MessagesTableComponent } from './pages/matter-details-page/components/messages-table/messages-table.component';
import { NotesListComponent } from './pages/matter-details-page/components/notes-list/notes-list.component';
import { SideMenuComponent } from './pages/matter-details-page/components/side-menu/side-menu.component';
import { MatterDetailsPageComponent } from './pages/matter-details-page/matter-details-page.component';
import { MattersPageComponent } from './pages/matters-page/matters-page.component';
import { MessageComponent } from './pages/messages-page/message/message.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MattersPageComponent },
  {
    path: 'create', component: EditMatterPageComponent,
    canActivate: [AttorneyGuard, ESignGuard],
  },
  {
    path: 'edit/:id', component: EditMatterPageComponent,
    canActivate: [AttorneyGuard, ESignGuard],
  },
  {
    path: ':id',
    component: MatterDetailsPageComponent,
  },
  {
    path: 'messages/:id',
    component: MessagesPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

/** Matters module. */
@NgModule({
  declarations: [
    MattersPageComponent,
    SideMenuComponent,
    ClientInfoComponent,
    EditMatterPageComponent,
    MatterDetailsPageComponent,
    EditNoteDialogComponent,
    MessagesTableComponent,
    NotesListComponent,
    ViewNoteDialogComponent,
    MatterInfoComponent,
    CloseMatterDialogComponent,
    MatterTopicDialogComponent,
    MessagesPageComponent,
    MessageComponent,
    ConsentsListComponent,
    ReferMatterDialogComponent,
    AddSupportDialogComponent,
  ],
  entryComponents: [
    EditNoteDialogComponent,
    ViewNoteDialogComponent,
    CloseMatterDialogComponent,
    MatterTopicDialogComponent,
    ReferMatterDialogComponent,
    AddSupportDialogComponent,
  ],
  imports: [
    NgxPermissionsModule.forChild(),
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    CommonSharedModule,
    DialogsModule,
    CommonDesktopModule,
  ],
})
export class MattersModule { }
