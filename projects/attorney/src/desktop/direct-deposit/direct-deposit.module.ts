import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttorneySharedModule } from '@jl/attorney/shared/shared.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { PaymentMethodComponent } from './components/payment-method/payment-method.component';
import { DirectDepositPageComponent } from './direct-deposit-page/direct-deposit-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DirectDepositPageComponent },
];

/**
 * Module for direct deposit functionality.
 */
@NgModule({
  declarations: [
    DirectDepositPageComponent,
    PaymentMethodComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonSharedModule,
    AttorneySharedModule,
  ],
})
export class DirectDepositModule { }
