import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileAccountInfoComponent } from '@jl/common/mobile/components/mobile-account-info-page/mobile-account-info-page.component';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { AdditionalInfoComponent } from './additional-info/additional-info.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'account-info' },
  {
    path: 'account-info',
    component: MobileAccountInfoComponent,
  },
  { path: 'edit', component: AdditionalInfoComponent },
];

/** Profile module. */
@NgModule({
  declarations: [AdditionalInfoComponent],
  imports: [
    CommonModule,
    CommonSharedModule,
    CommonMobileModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    IonicModule,
  ],
})
export class ProfileModule { }
