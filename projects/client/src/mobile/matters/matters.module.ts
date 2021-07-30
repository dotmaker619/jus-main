import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AttorneyMobileSharedModule } from '@jl/attorney/mobile/shared/shared.module';
import { MatterStatus } from '@jl/common/core/models/matter-status';
import { EditMatterPageComponent } from '@jl/common/mobile/modules/matters//edit-matter-page/edit-matter-page.component';
import { MatterDetailsPageComponent } from '@jl/common/mobile/modules/matters//matter-details-page/matter-details-page.component';
import { MattersPageComponent } from '@jl/common/mobile/modules/matters//matters-page/matters-page.component';
import { MessagesPageComponent } from '@jl/common/mobile/modules/matters//messages-page/messages-page.component';
import { MattersListComponent } from '@jl/common/mobile/modules/matters/matters-page/components/matters-list/matters-list.component';
import { MobileBaseMattersModule } from '@jl/common/mobile/modules/matters/matters.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

const routes: Routes = [
  {
    path: '',
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
        data: { statuses: [MatterStatus.Pending] },
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
  { path: 'create', component: EditMatterPageComponent },
  { path: ':id', component: MatterDetailsPageComponent },
  { path: ':id/edit', component: EditMatterPageComponent },
  {
    path: 'messages/:id',
    component: MessagesPageComponent,
  },
];

/** Matters module for mobile workspace. */
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AttorneyMobileSharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    MatAutocompleteModule,
    MobileBaseMattersModule,
  ],
})
export class MobileMattersModule { }
