import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AttorneySharedModule } from '@jl/attorney/shared/shared.module';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { DirectDepositPageComponent } from './direct-deposit-page/direct-deposit-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DirectDepositPageComponent },
];

/**
 * Direct deposit mobile module.
 */
@NgModule({
  declarations: [DirectDepositPageComponent],
  imports: [
    CommonModule,
    CommonSharedModule,
    CommonMobileModule,
    IonicModule,
    RouterModule.forChild(routes),
    AttorneySharedModule,
  ],
})
export class DirectDepositModule { }
