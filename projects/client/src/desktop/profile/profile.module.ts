import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientSharedModule } from '@jl/client/shared/client-shared.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { ClientInfoPageComponent } from './client-info-page/client-info-page.component';
import { ProfileEditPageComponent } from './profile-edit-page/profile-edit-page.component';
import { ProfileRoutingModule } from './profile-routing.module';

/**
 * Client profile module.
 */
@NgModule({
  declarations: [
    ProfileEditPageComponent,
    ClientInfoPageComponent,
  ],
  imports: [
    CommonModule,
    ClientSharedModule,
    CommonSharedModule,
    ProfileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ProfileModule { }
