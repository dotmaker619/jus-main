import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { StaffRegistrationComponent } from './staff-registration.component';

export const routes: Routes = [
  { path: '', component: StaffRegistrationComponent },
];

/** Staff registration module. */
@NgModule({
  declarations: [StaffRegistrationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    CommonMobileModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class StaffRegistrationModule { }
