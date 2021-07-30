import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { CreateEditDialogComponent } from './components/create-edit-dialog/create-edit-dialog.component';
import { CustomizationTabComponent } from './components/customization-tab/customization-tab.component';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { CustomizationsPageComponent } from './customizations-page/customizations-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: CustomizationsPageComponent },
];

/** Customizations module. */
@NgModule({
  declarations: [
    CustomizationsPageComponent,
    CreateEditDialogComponent,
    DeleteDialogComponent,
    CustomizationTabComponent,
  ],
  entryComponents: [
    CreateEditDialogComponent,
    DeleteDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatTabsModule,
    CommonSharedModule,
  ],
})
export class CustomizationsModule { }
