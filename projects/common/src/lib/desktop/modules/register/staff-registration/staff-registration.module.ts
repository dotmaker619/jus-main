import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { StaffRegistrationComponent } from './staff-registration.component';

/** Staff registration module. */
@NgModule({
  declarations: [
    StaffRegistrationComponent,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
  ],
})
export class StaffRegistrationModule {}
