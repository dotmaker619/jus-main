import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { AccountInfoComponent } from './account-info-page/account-info-page.component';
import { ProfileEditPageComponent } from './profile-edit-page/profile-edit-page.component';
import { ProfileRoutingModule } from './profile-routing.module';

/**
 * Profile module.
 */
@NgModule({
  declarations: [
    AccountInfoComponent,
    ProfileEditPageComponent,
  ],
  imports: [
    CommonModule,
    CommonSharedModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ProfileModule { }
