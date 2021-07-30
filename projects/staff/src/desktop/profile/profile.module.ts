import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { AccountInfoComponent } from './account-info/account-info.component';
import { StaffInfoComponent } from './staff-info/staff-info.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'account-info' },
  { path: 'account-info', component: AccountInfoComponent },
  { path: 'edit', component: StaffInfoComponent },
];

/**
 * Profile module.
 */
@NgModule({
  declarations: [AccountInfoComponent, StaffInfoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ProfileModule { }
