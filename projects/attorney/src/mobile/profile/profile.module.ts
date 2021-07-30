import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MobileAccountInfoComponent } from '@jl/common//mobile/components/mobile-account-info-page/mobile-account-info-page.component';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';
import { NgxMaskModule } from 'ngx-mask';

import { AttorneySharedModule } from '../../shared/shared.module';
import { AttorneyMobileSharedModule } from '../shared/shared.module';

import { MobileProfileEditPageComponent } from './mobile-profile-edit-page/mobile-profile-edit-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account-info',
    pathMatch: 'full',
  },
  {
    path: 'account-info',
    component: MobileAccountInfoComponent,
  },
  {
    path: 'edit',
    component: MobileProfileEditPageComponent,
  },
];

/** Matters module for mobile workspace. */
@NgModule({
  declarations: [
    MobileProfileEditPageComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CommonMobileModule,
    AttorneySharedModule,
    AttorneyMobileSharedModule,
    NgxMaskModule.forChild(),
  ],
})
export class MobileProfileModule { }
