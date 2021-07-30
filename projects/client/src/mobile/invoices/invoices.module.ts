import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonMobileModule } from '@jl/common/mobile/mobile.module';
import { SharedModule as CommonSharedModule } from '@jl/common/shared';

import { InvoiceDetailsPageComponent } from './invoice-details-page/invoice-details-page.component';
import { InvoicePaymentPageComponent } from './invoice-payment-page/invoice-payment-page.component';
import { InvoicesPageComponent } from './invoices-page/invoices-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: InvoicesPageComponent },
  { path: ':id', component: InvoiceDetailsPageComponent },
  { path: ':id/payment', component: InvoicePaymentPageComponent },
];

/** Invoices module for mobile. */
@NgModule({
  declarations: [
    InvoicesPageComponent,
    InvoiceDetailsPageComponent,
    InvoicePaymentPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    CommonMobileModule,
  ],
})
export class MobileInvoicesModule { }
