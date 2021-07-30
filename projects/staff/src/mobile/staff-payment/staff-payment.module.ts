import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { StaffPaymentComponent } from './staff-payment.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: StaffPaymentComponent },
];

/** Staff payment module. */
@NgModule({
  declarations: [StaffPaymentComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    CommonSharedModule,
  ],
})
export class StaffPaymentModule { }
