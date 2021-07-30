import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { AccountInfoComponent } from './account-info/account-info.component';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';

export const routes: Routes = [
  { path: 'account-info', component: AccountInfoComponent },
  { path: 'edit', component: AdditionalInfoComponent },
];

/** Profile module. */
@NgModule({
  declarations: [AccountInfoComponent, AdditionalInfoComponent],
  imports: [
    CommonModule,
    FormsModule,
    CommonMobileModule,
    CommonSharedModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class ProfileModule { }
