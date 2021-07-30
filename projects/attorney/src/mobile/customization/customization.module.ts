import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { CustomizationListItemComponent } from './customization-list-item/customization-list-item.component';
import { EditCheckItemModalComponent } from './edit-check-item-modal/edit-check-item-modal.component';
import { EditStageModalComponent } from './edit-stage-modal/edit-stage-modal.component';
import { MatterClosingChecklistPageComponent } from './matter-closing-checklist-page/matter-closing-checklist-page.component';
import { MatterStagesPageComponent } from './matter-stages-page/matter-stages-page.component';
import { MobileCustomizationsPageComponent } from './mobile-customizations-page/mobile-customizations-page.component';

const routes: Routes = [
  {
    path: '',
    component: MobileCustomizationsPageComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'stages' },
      { path: 'stages', component: MatterStagesPageComponent },
      { path: 'checklist', component: MatterClosingChecklistPageComponent },
    ],
  },
];

/**
 * Customization module for mobile workspace.
 */
@NgModule({
  declarations: [
    MobileCustomizationsPageComponent,
    MatterStagesPageComponent,
    MatterClosingChecklistPageComponent,
    EditStageModalComponent,
    EditCheckItemModalComponent,
    CustomizationListItemComponent,
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
    EditStageModalComponent,
    EditCheckItemModalComponent,
  ],
})
export class MobileCustomizationModule { }
