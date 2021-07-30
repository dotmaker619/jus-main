import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule, MatDatepickerModule, MatTabsModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { CommonDesktopModule } from '@jl/common/desktop/desktop.module';
import { CommonSharedModule } from '@jl/common/shared/shared.module';

import { InvoiceInfoTableComponent } from './components/invoice-info-table/invoice-info-table.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoicePaymentPageComponent } from './invoice-payment-page/invoice-payment-page.component';
import { InvoicesPageComponent } from './invoices-page/invoices-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: InvoicesPageComponent },
  { path: ':id', component: InvoiceDetailsComponent },
  { path: ':id/payment', component: InvoicePaymentPageComponent },
];

/**
 * Invoices module.
 */
@NgModule({
  declarations: [
    InvoicesPageComponent,
    InvoiceDetailsComponent,
    InvoicePaymentPageComponent,
    InvoiceInfoTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonDesktopModule,
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonSharedModule,
    MatTabsModule,
  ],
})
export class InvoicesModule { }
